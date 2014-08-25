class Reservation < ActiveRecord::Base
  include PgSearch
  include Sspable
  include Exportable
  include DatetimeSplittable
  include Taggable
  include I18n::Alchemy
  include Rails.application.routes.url_helpers

  # Associations
  belongs_to :organisation
  belongs_to :entity
  belongs_to :organisation_client
  belongs_to :reservation_status
  belongs_to :base_reservation, class_name: 'Reservation'

  has_one :reservation_recurrence_definition
  has_one :entity_type, through: :entity
  has_many :stickies, as: :stickable, dependent: :destroy
  has_many :reservation_logs, dependent: :destroy
  has_many :documents, as: :documentable, dependent: :destroy, inverse_of: :documentable

  # Model extensions
  attr_accessor :validate_overlapping # Should we validate not overlapping (default true)? Disabled for multiple edit actions.

  # Attribute modifiers
  split_datetime :begins_at, default: Time.now.ceil_to(1.hour)
  split_datetime :ends_at, default: Time.now.ceil_to(1.hour) + 1.hour
  normalize_attributes :description

  # Validations
  validates :organisation, presence: true
  validates :entity, presence: true
  validates :organisation_client, presence: true
  validates :reservation_status, presence: true
  validates :begins_at, presence: true
  validates :ends_at, presence: true, date_after: { date: :begins_at, date_error_format: :long }
  validates :slack_before, :slack_after, numericality: { allow_blank: true, greater_than_or_equal_to: 0 }
  validate :not_overlapping, if: :validate_overlapping
  #validate :slack_not_greater_than_max_slack, if: -> { self.entity.present? } # Temporary disable this validation to revert to the old behaviour (slack may overlap with other slack or reservation)
  validate :check_invalid_recurrences, if: :new_record?
  validate :ensure_period_valid, if: -> { entity.present? && begins_at.present? && ends_at.present? }

  # Callbacks
  after_initialize :init # new_record check is intentionally omitted since @validate_overlapping should also be initialized for already existing records

  before_validation :check_reservation_organisation
  before_validation :check_if_should_update_reservation_status
  before_validation :generate_recurrences, if: :new_record?
  before_save :update_warning_state
  after_create :save_recurrences
  after_save :update_warning_state_neighbours
  after_save :trigger_occupation_recalculation, if: :occupation_recalculation_needed?
  after_save :trigger_update_websockets

  before_destroy :fix_base_reservation_reference, if: -> { base_reservation_id == id }
  after_destroy :trigger_update_websockets
  after_destroy :trigger_occupation_recalculation, if: :occupation_recalculation_needed?

  # Nested attributes
  accepts_nested_attributes_for :organisation_client
  accepts_nested_attributes_for :reservation_recurrence_definition
  accepts_nested_attributes_for :documents, allow_destroy: true, reject_if: :all_blank

  # Scopes
  pg_global_search against: { id: 'A', description: 'B' }, associated_against: { organisation_client: { first_name: 'C', last_name: 'C', locality: 'D' }, entity: { name: 'C' }, stickies: { sticky_text: 'C' } }

  scope :blocking, -> { joins(:reservation_status).where('reservation_statuses.blocking = true') }
  scope :non_blocking, -> { joins(:reservation_status).where('reservation_statuses.blocking = false') }
  scope :info_boards,  -> { joins(:reservation_status).where('reservation_statuses.info_boards = true') }
  scope :billable, -> { joins(:reservation_status).where('reservation_statuses.billable = true') }

  default_order { order(id: :desc) }

  ##
  # Class methods
  ##

  # Get all reservations within the date domain.
  # Options:
  # - delocalize: delocalize dates with the current locale if they are strings
  # - include_edges: indicates that we also want the reservations directly outside the scope. This can be useful to check for collisions.
  # - ignore_reservations: exclude the listed reservations or reservation ids. This can be useful to check if an entity is available when editting a reservation.
  def self.by_date_domain(from, to, options = {})
    # Delocalize or parse from and to as date (if strings)
    from = (options[:delocalize] ? Date.strptime(from, I18n.t('date.formats.default')) : from.to_date) if from.present? && from.is_a?(String)
    to = (options[:delocalize] ? Date.strptime(to, I18n.t('date.formats.default')) : to.to_date) if to.present? && to.is_a?(String)

    # Translate dates to beginning and end of day
    from = from.beginning_of_day if from.is_a?(Date)
    to = to.end_of_day if to.is_a?(Date)

    if options[:include_edges]
      # Include reservations directly before and after the scope as well. If there are no reservations found, then simply use the given date.
      from = self.where('ends_at <= :begin', begin: from).reorder(ends_at: :desc).first.try(:begins_at) || from if from.present?
      to = self.where('begins_at > :end', end: to).reorder(begins_at: :asc).first.try(:ends_at) || to if to.present?
    end

    # Get reservations in domain
    rel = self.all
    rel = rel.where('ends_at > :begin', begin: from) if from.present?
    rel = rel.where('begins_at <= :end', end: to) if to.present?
    rel = rel.where.not(id: options[:ignore_reservations]) if options[:ignore_reservations].present?
    rel
  end

  def self.export_data
    {
      id: true,
      reservation_status: true,
      description: true,
      organisation_client: true,
      entity: true,
      begins_at: true,
      ends_at: true,
      created_at: true,
    }
  end

  ##
  # Instance methods
  ##

  def init # Note: in this case init is also executed for already existing records
    @validate_overlapping ||= true
  end

  def instance_name
    "R##{self.id.to_s}"
  end

  def get_slack_before
    return read_attribute(:slack_before) if read_attribute(:slack_before).present?
    return self.entity.get_slack_before
  end

  def get_slack_after
    return read_attribute(:slack_after) if read_attribute(:slack_after).present?
    return self.entity.get_slack_after
  end

  def length
    self.ends_at - self.begins_at
  end

  def cost
    entity.reservation_cost(self.begins_at, self.ends_at)
  end

  def days
    period_to_days(begins_at, ends_at)
  end

  def days_was
    begins_at_was.present? && ends_at_was.present? ? period_to_days(begins_at_was, ends_at_was) : nil
  end

  # Get the reservation directly before this reservation (for the same entity).
  # If was = true, then the old times for this reservation will be used.
  def previous(was = false)
    begins_at = (was ? self.begins_at_was : self.begins_at)
    self.entity.reservations.where('ends_at <= :begins_at', begins_at: begins_at).where.not(id: self.id).reorder(ends_at: :desc).first
  end

  # Get the reservation directly after this reservation (for the same entity).
  # If was = true, then the old times for this reservation will be used.
  def next(was = false)
    ends_at = (was ? self.ends_at_was : self.ends_at)
    self.entity.reservations.where('begins_at >= :ends_at', ends_at: ends_at).where.not(id: self.id).reorder(begins_at: :asc).first
  end

  def one_line_summary
    desc = self.description.present? ? self.description : I18n.t('reservations.show.no_description')
    beg = I18n.l(self.begins_at, format: :long)
    en = I18n.l(self.ends_at, format: :long)
    "R##{self.id.to_s}: #{desc}, #{self.organisation_client.instance_name}, #{beg} --> #{en}."
  end

  # Checks if the given slack before is overlapping with a previous reservation.
  # Returns nil if this is not the case, returns the overlapping reservation if this is the case.
  def slack_before_overlapping
    previous_reservation = self.previous
    return nil if previous_reservation.nil?

    total_slack = self.get_slack_before + previous_reservation.get_slack_after

    if self.begins_at - previous_reservation.ends_at < total_slack.minutes
      return previous_reservation
    end
  end

  def slack_before_overlapping?
    slack_before_overlapping.present?
  end

  # Checks if the given slack after is overlapping with a next reservation.
  # Returns nil if this is not the case, returns the overlapping reservation if this is the case.
  def slack_after_overlapping
    next_reservation = self.next
    return nil if next_reservation.nil?

    total_slack = self.get_slack_after + next_reservation.get_slack_before

    if next_reservation.begins_at - self.ends_at < total_slack.minutes
      return next_reservation
    end
  end

  def slack_after_overlapping?
    slack_after_overlapping.present?
  end

  def length_for_day(day)
    if day < self.begins_at.to_date || day > self.ends_at.to_date
      return 0
    elsif day < self.ends_at.to_date && day == self.begins_at.to_date
      return (day + 1.day).to_time - self.begins_at
    elsif day > self.begins_at.to_date && day == self.ends_at.to_date
      return self.ends_at - day.to_time
    elsif day == self.begins_at.to_date && day == self.ends_at.to_date
      return self.ends_at - self.begins_at
    else
      return 86400
    end
  end

  def length_for_week(week)
    week.to_days.map { |day| self.length_for_day(day) }.sum
  end

  def recurrences
    @recurrences ||=
      if self.base_reservation.present?
        self.organisation.reservations.where(base_reservation: self.base_reservation).order(:begins_at)
      else
        []
      end
  end

  def not_overlapping_with_set(set_reservations)
    valid = true
    relation = set_reservations.joins(:reservation_status).where('reservations.id <> ? AND reservation_statuses.blocking = true', self.id.to_i)
    total_overlap = relation.where('(:begins_at <= begins_at AND :ends_at >= ends_at) OR (:begins_at >= begins_at AND :ends_at <= ends_at)', begins_at: begins_at, ends_at: ends_at).first
    if total_overlap.present?
      # Total overlap means this reservation is completely within another reservation or completely over another reserveration, so we do not know whether it is best to change the begins_at or the ends_at to fix this problem.
      errors.add(:base, I18n.t('activerecord.errors.models.reservation.total_overlap_html', reservation_url: organisation_reservation_path(total_overlap.organisation, total_overlap), other_begins_at: I18n.l(total_overlap.begins_at, format: :long), other_ends_at: I18n.l(total_overlap.ends_at, format: :long)).html_safe)
      errors.add(:begins_at, false)
      errors.add(:ends_at, false)
      valid = false
    else
      # No complete overlap, but maybe just the ends_at overlaps
      ends_at_overlap = relation.where('begins_at < :ends_at AND :ends_at <= ends_at', ends_at: ends_at).first
      if ends_at_overlap.present?
        #errors.add(:ends_at, :ends_at_html, reservation_url: organisation_reservation_path(ends_at_overlap.organisation, ends_at_overlap), other_begins_at: I18n.l(ends_at_overlap.begins_at, format: :long))
        errors.add(:ends_at, I18n.t('activerecord.errors.models.reservation.attributes.ends_at.ends_at_html', reservation_url: organisation_reservation_path(ends_at_overlap.organisation, ends_at_overlap), other_begins_at: I18n.l(ends_at_overlap.begins_at, format: :long)).html_safe)
        valid = false
      end
      # Or just the begins_at overlaps
      begins_at_overlap = relation.where('begins_at <= :begins_at AND :begins_at < ends_at', begins_at: begins_at).first
      if begins_at_overlap.present?
        errors.add(:begins_at, I18n.t('activerecord.errors.models.reservation.attributes.begins_at.begins_at_html', reservation_url: organisation_reservation_path(begins_at_overlap.organisation, begins_at_overlap), other_ends_at: I18n.l(begins_at_overlap.ends_at, format: :long)).html_safe)
        valid = false
      end
    end
    valid
  end

  def update_warning_state
    self.warning = slack_before_overlapping? || slack_after_overlapping?
    self
  end

  def update_warning_state!
    update_warning_state.update_attribute(:warning, self[:warning])
  end

  def current_progress
    progress_wrt_time_point(Time.now)
  end

  def progress_wrt_time_point(point)
    seconds = self.ends_at.to_time.to_i - self.begins_at.to_time.to_i
    seconds_past = point.to_i - self.begins_at.to_time.to_i
    (seconds_past.to_f / seconds.to_f * 100.00).round(2)
  end

private
  def fix_base_reservation_reference
    # The first reservation of a repeating set is removed!
    repeating_set = self.class.where(base_reservation_id: self.id).where.not(id: self.id).reorder(begins_at: :asc)
    repeating_set.update_all(base_reservation_id: repeating_set.first.id) if repeating_set.present?
  end

  def check_if_should_update_reservation_status
    return if self.entity.nil?
    if self.reservation_status.nil?
      self.reservation_status = self.entity.entity_type.reservation_statuses.order(:index).first
    elsif self.entity_id_was.present? && self.entity_id_changed?
      # entity is changed, check if the same reservation status set is applicable
      if self.entity.entity_type != self.organisation.entities.find(self.entity_id_was).entity_type
        self.reservation_status = self.entity.entity_type.reservation_statuses.order(:index).first
      end
    end
  end

  def update_warning_state_neighbours
    if self.begins_at_changed?
      # If begin times for this reservation changed, then update warnings for old and new first neighbour as well.
      previous_reservation = self.previous(true)
      previous_reservation.update_warning_state! if previous_reservation.present?

      previous_reservation = self.previous
      previous_reservation.update_warning_state! if previous_reservation.present?
    end

    if self.ends_at_changed?
      # If begin times for this reservation changed, then update warnings for old and new first neighbour as well.
      next_reservation = self.next(true)
      next_reservation.update_warning_state! if next_reservation.present?

      next_reservation = self.next
      next_reservation.update_warning_state! if next_reservation.present?
    end
  end

  def generate_recurrences
    self.reservation_recurrence_definition.generate_recurrences if self.reservation_recurrence_definition.present? && self.reservation_recurrence_definition.valid?
  end

  def check_invalid_recurrences
    if self.errors.empty? && self.reservation_recurrence_definition.present? && self.reservation_recurrence_definition.repeating
      invalid_reservations = self.reservation_recurrence_definition.check_invalid_recurrences
      invalid_reservations.each do |invalid_reservation|
        invalid_reservation.errors.full_messages.each do |ir_message|
          if ir_message
            errors.add(:base, I18n.t('activerecord.errors.models.reservation.repetition_error_html', begins_at: I18n.l(invalid_reservation.begins_at, format: :long), ir_message: ir_message).html_safe)
          end
        end
      end
    end
  end

  def slack_not_greater_than_max_slack
    slack_before_overlap = self.slack_before_overlapping
    if slack_before_overlap.present?
        errors.add(:slack_before, I18n.t('activerecord.errors.models.reservation.attributes.slack_before.slack_before_html', reservation_url: organisation_reservation_path(slack_before_overlap.organisation, slack_before_overlap), other_ends_at: I18n.l(slack_before_overlap.ends_at, format: :long)).html_safe)
    end

    slack_after_overlap = self.slack_after_overlapping
    if slack_after_overlap.present?
        errors.add(:slack_after, I18n.t('activerecord.errors.models.reservation.attributes.slack_before.slack_after_html', reservation_url: organisation_reservation_path(slack_after_overlap.organisation, slack_after_overlap), other_ends_at: I18n.l(slack_after_overlap.ends_at, format: :long)).html_safe)
    end
  end

  def not_overlapping
    not_overlapping_with_set(self.entity.reservations) if self.entity.present?
  end

  def ensure_period_valid
    # Check if reservation period is possible according to reserver periods
    errors.add(:base, I18n.t('activerecord.errors.models.reservation.period_not_allowed')) unless entity.reservation_matches_periods?(begins_at, ends_at)
    # Check if reservation period is long enough
    errors.add(:base, I18n.t('activerecord.errors.models.reservation.period_too_small', count: entity.min_reservation_length)) if entity.min_reservation_length_seconds.present? && length < entity.min_reservation_length_seconds
    # Check if reservation period is not too long
    errors.add(:base, I18n.t('activerecord.errors.models.reservation.period_too_large', count: entity.max_reservation_length)) if entity.max_reservation_length_seconds.present? && length > entity.max_reservation_length_seconds
  end

  def save_recurrences
    self.reservation_recurrence_definition.save_recurrences if self.reservation_recurrence_definition.present?
    # Remove recurrence model such that it will not be saved in the next step
    self.reservation_recurrence_definition = nil
  end

  def occupation_recalculation_needed?
    # Recalculation is needed when the reservation is destroyed or when the begins_at or ends_at date/time are changed (which is also the case for new records)
    return self.destroyed? || self.begins_at_changed? || self.ends_at_changed?
  end

  def trigger_occupation_recalculation
    # Note: this code could be more optimized for updates (for example, when we move a reservation in the same day, then no recalculations are necessary)
    if self.days_was.present?
      # Perform recalculations for old range
      DayOccupation.recalculate_occupations(self.entity, days_was)
      WeekOccupation.recalculate_occupations(self.entity, Week.from_date(days_was.min)..Week.from_date(days_was.max))
    end

    unless self.destroyed?
      # Perform recalculations for new range
      DayOccupation.recalculate_occupations(self.entity, days)
      WeekOccupation.recalculate_occupations(self.entity, Week.from_date(days.min)..Week.from_date(days.max))
    end
  end

  def trigger_update_websockets
    WebsocketRails[('infoscreens_' + self.organisation.id.to_s).to_sym].trigger 'update'
    WebsocketRails[('todayandtomorrows_' + self.organisation.id.to_s).to_sym].trigger 'update'
  end

  # Converts a period (begins datetime to ends datetime range) to a days (dates) range
  def period_to_days(begins, ends)
    from = begins.to_date
    to = ends.to_date
    if ends.strftime("%H:%M") == '00:00'
      # The reservation ends at exactly 00:00 meaning the
      to -= 1.day
    end
    from..to
  end

  def check_reservation_organisation
    # TODO this looks rather scarry. Are we sure this should be done this way?
    if self.organisation_client.present? && self.organisation_client.organisation.nil?
      self.organisation_client.organisation = self.organisation
    end
  end
end
