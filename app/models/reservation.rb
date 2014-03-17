class Reservation < ActiveRecord::Base
  include PgSearch
  include Sspable
  include Exportable
  include DatetimeSplittable
  include I18n::Alchemy
  include Rails.application.routes.url_helpers

  attr_accessor :validate_overlapping

  belongs_to :organisation_client
  belongs_to :entity
  belongs_to :organisation
  belongs_to :reservation_status
  belongs_to :base_reservation, class_name: 'Reservation'
  has_many :stickies, as: :stickable, dependent: :destroy
  has_many :reservation_logs, dependent: :destroy
  has_one :reservation_recurrence_definition

  validates :begins_at, presence: true
  validates :ends_at, presence: true, date_after: { date: :begins_at, date_error_format: :long }
  validates :entity, presence: true
  validates :organisation_client, presence: true
  validates :organisation, presence: true
  validates :reservation_status, presence: true, if: 'self.entity.present?'
  validate :not_overlapping, if: :validate_overlapping
  validate :check_invalid_recurrences, if: :new_record?

  validates :slack_before, numericality: { allow_blank: true }
  validates :slack_after, numericality: { allow_blank: true }

  split_datetime :begins_at, default: Time.now.ceil_to(1.hour)
  split_datetime :ends_at, default: Time.now.ceil_to(1.hour) + 1.hour

  accepts_nested_attributes_for :organisation_client
  accepts_nested_attributes_for :reservation_recurrence_definition

  normalize_attributes :description

  before_validation :check_reservation_organisation
  before_validation :check_if_should_update_reservation_status
  before_validation :generate_recurrences, if: :new_record?
  after_create :save_recurrences
  before_save :update_warning_state
  after_save :update_warning_state_neighbours

  after_save :trigger_occupation_recalculation, if: :occupation_recalculation_needed?
  after_save :trigger_update_websockets
  after_destroy :trigger_update_websockets
  after_destroy :trigger_occupation_recalculation, if: :occupation_recalculation_needed?
  before_destroy :fix_base_reservation_reference, if: 'self.base_reservation_id == self.id'

  pg_global_search against: { id: 'A', description: 'B' }, associated_against: { organisation_client: { first_name: 'C', last_name: 'C', locality: 'D' }, entity: { name: 'C' }, stickies: { sticky_text: 'C' } }

  scope :blocking, -> { joins(:reservation_status).where('reservation_statuses.blocking = true') }
  scope :non_blocking, -> { joins(:reservation_status).where('reservation_statuses.blocking = false') }
  scope :info_boards,  -> { joins(:reservation_status).where('reservation_statuses.info_boards = true') }
  scope :billable, -> { joins(:reservation_status).where('reservation_statuses.billable = true') }

  default_order { order(id: :desc) }

  # Get all reservations within the date domain.
  # Options:
  # - delocalize: delocalize dates with the current locale if they are strings
  # - include_edges: indicates that we also want the reservations directly outside the scope. This can be useful to check for collisions.
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

  def get_slack_before
    return read_attribute(:slack_before) if read_attribute(:slack_before).present?
    return self.entity.get_slack_before
  end

  def get_slack_after
    return read_attribute(:slack_after) if read_attribute(:slack_after).present?
    return self.entity.get_slack_after
  end

  def initialize(attributes = {})
    super
    @validate_overlapping = true
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

  def total_length
    self.ends_at - self.begins_at
  end

  def length_for_week(week)
    week.to_days.map { |day| self.length_for_day(day) }.sum
  end

  def days
    period_to_days(begins_at, ends_at)
  end

  def days_was
    begins_at_was.present? && ends_at_was.present? ? period_to_days(begins_at_was, ends_at_was) : nil
  end

  def instance_name
    "R##{self.id.to_s}"
  end

  def one_line_summary
    desc = self.description.present? ? self.description : I18n.t('reservations.show.no_description')
    beg = I18n.l(self.begins_at, format: :long)
    en = I18n.l(self.ends_at, format: :long)
    "R##{self.id.to_s}: #{desc}, #{self.organisation_client.instance_name}, #{beg} --> #{en}."
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

  def previous(was = false)
    begins_at = (was ? self.begins_at_was : self.begins_at)
    self.entity.reservations.where('ends_at <= :begins_at', begins_at: begins_at).where.not(id: self.id).reorder(ends_at: :desc).first
  end

  def next(was = false)
    ends_at = (was ? self.ends_at_was : self.ends_at)
    self.entity.reservations.where('begins_at >= :ends_at', ends_at: ends_at).where.not(id: self.id).reorder(begins_at: :asc).first
  end

  def update_warning_state
    self.warning = slack_before_overlapping || slack_after_overlapping
    self
  end

  def update_warning_state!
    update_warning_state.update_attribute(:warning, self[:warning])
  end

  def slack_before_overlapping
    previous_reservation = self.previous
    return false if previous_reservation.nil?

    total_slack = self.get_slack_before + previous_reservation.get_slack_after

    return self.begins_at - previous_reservation.ends_at < total_slack.minutes
  end

  def slack_after_overlapping
    next_reservation = self.next
    return false if next_reservation.nil?

    total_slack = self.get_slack_after + next_reservation.get_slack_before

    return next_reservation.begins_at - self.ends_at < total_slack.minutes
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

  def not_overlapping
    if self.entity.present?
      not_overlapping_with_set(self.entity.reservations)
    end
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
    if self.organisation_client.present? && self.organisation_client.organisation.nil?
      self.organisation_client.organisation = self.organisation
    end
  end
end
