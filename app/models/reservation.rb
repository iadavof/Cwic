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
  belongs_to :status, class_name: 'ReservationStatus'
  belongs_to :base_reservation, class_name: 'Reservation'

  has_one :reservation_recurrence_definition
  has_one :entity_type, through: :entity
  has_many :stickies, as: :stickable, dependent: :destroy
  has_many :documents, as: :documentable, dependent: :destroy, inverse_of: :documentable

  # Model extensions
  attr_accessor :validate_not_conflicting # Should we validate not conflicting with other reservations (default true)? Disabled for multiple edit actions.
  audited only: [:description, :entity_id, :organisation_client_id, :status_id, :begins_at, :ends_at, :slack_before, :slack_after], allow_mass_assignment: true

  # Attribute modifiers
  split_datetime :begins_at, default: Time.now.ceil_to(1.hour)
  split_datetime :ends_at, default: Time.now.ceil_to(1.hour) + 1.hour

  # Validations
  validates :organisation, presence: true
  validates :entity, presence: true
  validates :organisation_client, presence: true
  validates :status, presence: true, if: -> { entity.present? }
  validates :begins_at, presence: true
  validates :ends_at, presence: true, date_after: { date: :begins_at, date_error_format: :long }
  validates :slack_before, :slack_after, numericality: { allow_blank: true, greater_than_or_equal_to: 0 }
  validate :not_conflicting_with_reservations, if: -> { entity.present? && validate_not_conflicting }
  validate :ensure_recurrences_valid, on: :create, if: -> { recurrence_definition_recurring? && errors.empty? }
  validate :ensure_period_valid, if: -> { entity.present? && begins_at.present? && ends_at.present? }

  # Callbacks
  after_initialize :init # new_record check is intentionally omitted since @validate_not_conflicting should also be initialized for already existing records

  before_validation :set_organisation_client_organisation
  before_validation :set_default_status, if: -> { entity_type_changed? && entity_type.present? }
  before_validation :generate_recurrences, on: :create, if: :recurrence_definition_recurring?
  before_save :update_warning_state
  after_create :save_recurrences, on: :create, if: :recurrence_definition_recurring?
  after_save :update_warning_state_neighbours
  after_save :trigger_occupation_recalculation, if: :occupation_recalculation_needed?
  after_save :trigger_update_websockets, if: -> { Object.const_defined?('WebsocketRails') }

  before_destroy :fix_base_reservation_reference, if: -> { base_reservation_id == id }
  after_destroy :trigger_update_websockets, if: -> { Object.const_defined?('WebsocketRails') }
  after_destroy :trigger_occupation_recalculation, if: :occupation_recalculation_needed?

  # Nested attributes
  accepts_nested_attributes_for :organisation_client
  accepts_nested_attributes_for :reservation_recurrence_definition
  accepts_nested_attributes_for :documents, allow_destroy: true, reject_if: :all_blank

  # Scopes
  pg_global_search against: { id: 'A', description: 'B' }, associated_against: { organisation_client: { first_name: 'C', last_name: 'C', locality: 'D' }, entity: { name: 'C' }, stickies: { sticky_text: 'C' } }

  scope :past, -> (now = Time.now) { where('ends_at <= :now', now: now) }
  scope :past_or_now, -> (now = Time.now) { where('begins_at <= :now', now: now) }
  scope :now, -> (now = Time.now) { where('begins_at <= :now AND :now < ends_at', now: now) }
  scope :now_or_future, -> (now = Time.now) { where('ends_at > :now', now: now) }
  scope :future, -> (now = Time.now) { where('begins_at > :now', now: now) }

  scope :blocking, -> { joins(:status).where(reservation_statuses: { blocking: true }) }
  scope :non_blocking, -> { joins(:status).where(reservation_statuses: { blocking: false }) }
  scope :info_boards,  -> { joins(:status).where(reservation_statuses: { info_boards: true }) }
  scope :billable, -> { joins(:status).where(reservation_statuses: { billable: true }) }

  default_order { order(:begins_at) }

  # Class methods

  # Get all reservations that start OR end within the time domain (overlap with the date domain).
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
      to = self.where('begins_at >= :end', end: to).reorder(begins_at: :asc).first.try(:ends_at) || to if to.present?
    end

    # Get reservations in domain
    rel = self.all
    rel = rel.where('ends_at > :begin', begin: from) if from.present?
    rel = rel.where('begins_at < :end', end: to) if to.present?
    rel = rel.where.not(id: options[:ignore_reservations]) if options[:ignore_reservations].present?
    rel
  end

  def self.export_data
    {
      id: true,
      status: true,
      description: true,
      organisation_client: true,
      entity: true,
      begins_at: true,
      ends_at: true,
      created_at: true,
    }
  end

  # Instance methods

  def init # Note: in this case init is also executed for already existing records
    @validate_not_conflicting ||= true
  end

  def instance_name
    "R##{self.id}"
  end

  def full_instance_name(number: true, description: true, client: true, begins_at: false, ends_at: false)
    name = ""
    name << instance_name if number
    name << "#{': ' if name.present?}#{self.description}" if description && self.description.present?
    name << "#{' | ' if name.present?}#{organisation_client.instance_name}" if client && organisation_client.present?
    if begins_at && ends_at && self.begins_at.present? && self.ends_at.present?
      beg = I18n.l(self.begins_at)
      en = I18n.l(self.ends_at)
      name << "#{' | ' if name.present?}#{beg} -> #{en}"
    elsif begins_at && self.begins_at.present?
      beg = I18n.l(self.begins_at)
      name = "#{beg} #{name}"
    elsif ends_at && self.ends_at.present?
      en = I18n.l(self.ends_at)
      name = "#{en} #{name}"
    end
    name
  end

  def slack_before
    super.present? ? super : entity.try(:slack_before)
  end

  def slack_after
    super.present? ? super : entity.try(:slack_after)
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

  # Is the reservation in the past (has it already ended)?
  def past?(now = Time.now)
    ends_at <= now
  end

  # Is the reservation in the past or currently ongoing?
  def past_or_now?(now = Time.now)
    past?(now) || now?(now)
  end

  # Is the reservation currently ongoing?
  def now?(now = Time.now)
    begins_at <= now && now < ends_at
  end

  # Is the reservatrion in the future or currently ongoing?
  def now_or_future?(now = Time.now)
    now?(now) || future?(now)
  end

  # Is the reservation (strictly) in the future?
  def future?(now = Time.now)
    begins_at > now
  end

  # Is the reservation within the given timespan?
  # By default this is a strict check: the reservation is NOT within its own begins_at and ends_at.
  # When strict set to false the reservation may also have just started at the from time (the reservation is within its own begins_at and ends_at).
  def within?(from, to, strict: true)
    if strict
      future?(from) && past?(to)
    else
      (from == begins_at || future?(from)) && past?(to)
    end
  end

  # Does the reservation overlap with the given timespan?
  def overlaps?(from, to)
    now_or_future?(from) && past_or_now?(to - 1) # End times are considered to be exclusive so we extract one second
  end

  # Does the reservation overlap with another reservation?
  def overlaps_with_reservation?(other)
    other.overlaps?(begins_at, ends_at)
  end

  # Does the reservation conflict with another reservation?
  # Conflicting reservations are overlapping reservations for the same entity that are both blocking.
  def conflicts_with_reservation?(other)
    other.entity == entity && other.reservation_status.blocking? && reservation_status.blocking? && other.overlaps_with_reservation?(self)
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

  # Checks if the slack before is overlapping with (the slack of) a previous reservation.
  def slack_before_overlapping?
    previous_reservation = self.previous
    return false if previous_reservation.nil?

    total_slack = self.slack_before + previous_reservation.slack_after

    self.begins_at - previous_reservation.ends_at < total_slack.minutes
  end

  # Checks if the slack after is overlapping with (the slack of) a next reservation.
  def slack_after_overlapping?
    next_reservation = self.next
    return false if next_reservation.nil?

    total_slack = self.slack_after + next_reservation.slack_before

    next_reservation.begins_at - self.ends_at < total_slack.minutes
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
    @recurrences ||= (base_reservation.present? ? organisation.reservations.where(base_reservation: base_reservation).order(:begins_at) : [])
  end

  # Check if the reservation is not overlapping with other reservations for the same entity.
  # It is possible to overwrite the set of reservations to check in. This is useful for multiple edit actions.
  def not_conflicting_with_reservations(reservations = nil)
    valid = true
    reservations ||= self.entity.reservations.blocking.where('reservations.id <> ?', self.id.to_i)
    total_overlap = reservations.where('(:begins_at <= begins_at AND :ends_at >= ends_at) OR (:begins_at >= begins_at AND :ends_at <= ends_at)', begins_at: begins_at, ends_at: ends_at).first
    if total_overlap.present?
      # Total overlap means this reservation is completely within another reservation or completely over another reserveration, so we do not know whether it is best to change the begins_at or the ends_at to fix this problem.
      errors.add(:base, I18n.t('activerecord.errors.models.reservation.total_overlap_html', reservation_url: organisation_reservation_path(total_overlap.organisation, total_overlap), other_begins_at: I18n.l(total_overlap.begins_at, format: :long), other_ends_at: I18n.l(total_overlap.ends_at, format: :long)).html_safe)
      errors.add(:begins_at, false)
      errors.add(:ends_at, false)
      valid = false
    else
      # No complete overlap, but maybe just the ends_at overlaps
      ends_at_overlap = reservations.where('begins_at < :ends_at AND :ends_at <= ends_at', ends_at: ends_at).first
      if ends_at_overlap.present?
        errors.add(:ends_at, I18n.t('activerecord.errors.models.reservation.attributes.ends_at.ends_at_html', reservation_url: organisation_reservation_path(ends_at_overlap.organisation, ends_at_overlap), other_begins_at: I18n.l(ends_at_overlap.begins_at, format: :long)).html_safe)
        valid = false
      end
      # Or just the begins_at overlaps
      begins_at_overlap = reservations.where('begins_at <= :begins_at AND :begins_at < ends_at', begins_at: begins_at).first
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
    # The first reservation of a recurring set is removed: update the base reservation of all others
    recurrences = self.class.where(base_reservation_id: self.id).where.not(id: self.id).reorder(begins_at: :asc)
    recurrences.update_all(base_reservation_id: recurrences.first.id) if recurrences.present?
  end

  def set_default_status
    # Called on entity_type_changed, thus also for new reservations.
    self.status = entity_type.default_reservation_status
  end

  def entity_type_changed?
    # Also returns true when entity (and thus entity type) was not set, but is now.
    entity_id_changed? && (entity_id_was.nil? || entity_type != Entity.find(entity_id_was).entity_type)
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

  # Should we perform recurrence definition related callbacks
  def recurrence_definition_recurring?
    reservation_recurrence_definition.present? && reservation_recurrence_definition.valid? && reservation_recurrence_definition.repeating?
  end

  def generate_recurrences
    reservation_recurrence_definition.generate_recurrences
  end

  def ensure_recurrences_valid
    self.reservation_recurrence_definition.invalid_recurrences.each do |invalid_reservation|
      invalid_reservation.errors.full_messages.select(&:present?).each do |ir_message|
        errors.add(:base, I18n.t('activerecord.errors.models.reservation.repetition_error_html', begins_at: I18n.l(invalid_reservation.begins_at, format: :long), ir_message: ir_message).html_safe)
      end
    end
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
    self.reservation_recurrence_definition.save_recurrences
    # Remove recurrence model such that it will not be saved in the next step
    self.reservation_recurrence_definition = nil
    # Set the base reservation of the main recurrence to self
    self.update_column(:base_reservation_id, self.id) # Use update_column to avoid triggering callbacks and adding a double audit log
  end

  def occupation_recalculation_needed?
    # Recalculation is needed when the reservation is destroyed or when the begins_at or ends_at date/time are changed (which is also the case for new records)
    return self.destroyed? || self.begins_at_changed? || self.ends_at_changed?
  end

  def trigger_occupation_recalculation
    # Note: this code could be more optimized for updates (for example, when we move a reservation in the same day, then no recalculations are necessary)
    if self.days_was.present?
      # Perform recalculations for old range
      DayOccupation.recalculate(self.entity, days_was)
      WeekOccupation.recalculate(self.entity, Week.from_date(days_was.min)..Week.from_date(days_was.max))
    end

    unless self.destroyed?
      # Perform recalculations for new range
      DayOccupation.recalculate(self.entity, days)
      WeekOccupation.recalculate(self.entity, Week.from_date(days.min)..Week.from_date(days.max))
    end
  end

  def trigger_update_websockets
    WebsocketRails["infoscreens_#{organisation.id}"].trigger('update')
    WebsocketRails["todayandtomorrows_#{organisation.id}"].trigger('update')
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

  def set_organisation_client_organisation
    organisation_client.organisation ||= organisation if organisation_client.present?
  end
end
