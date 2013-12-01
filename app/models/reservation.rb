class Reservation < ActiveRecord::Base
  include PgSearch
  include DatetimeSplittable
  include I18n::Alchemy

  belongs_to :organisation_client
  belongs_to :entity
  belongs_to :organisation
  belongs_to :reservation_status
  has_many :stickies, as: :stickable, dependent: :destroy

  validates :begins_at, presence: true
  validates :ends_at, presence: true, date_after: { date: :begins_at, date_error_format: :long }
  validates :entity, presence: true
  validates :organisation_client, presence: true
  validate :not_overlapping

  split_datetime :begins_at, default: Time.now.ceil_to(1.hour)
  split_datetime :ends_at, default: Time.now.ceil_to(1.hour) + 1.hour

  accepts_nested_attributes_for :organisation_client

  before_validation :check_reservation_organisation
  before_validation { self.description.strip! }
  after_save :trigger_occupation_recalculation, if: :occupation_recalculation_needed?
  after_save :trigger_update_infoscreens
  before_save :check_if_should_nillify_reservation_status
  after_destroy :trigger_update_infoscreens
  after_destroy :trigger_occupation_recalculation, if: :occupation_recalculation_needed?

  pg_global_search against: { id: 'A', description: 'B' }, associated_against: { organisation_client: { first_name: 'C', last_name: 'C', locality: 'D' }, entity: { name: 'C' }, stickies: { sticky_text: 'C' } }

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

  def days
    period_to_days(begins_at, ends_at)
  end

  def days_was
    begins_at_was.present? && ends_at_was.present? ? period_to_days(begins_at_was, ends_at_was) : nil
  end

  def instance_name
    "R##{self.id.to_s}"
  end

private

  def check_if_should_nillify_reservation_status
    if self.entity_id_was.present? && self.entity_id_changed?
      # entity is changed, check if the same reservation status set is applicable
      if self.entity.entity_type != self.organisation.entities.find(self.entity_id_was).entity_type
        self.reservation_status = nil
      end
    end
  end

  def not_overlapping
    if entity.present?
      relation = entity.reservations.where.not(id: self.id)
      ends_at_overlap = relation.where('begins_at < :ends_at AND :ends_at < ends_at', ends_at: ends_at).first
      begins_at_overlap = relation.where('begins_at < :begins_at AND :begins_at < ends_at', begins_at: begins_at).first
      if ends_at_overlap.present?
        errors.add(:ends_at, I18n.t('activerecord.errors.models.reservation.attributes.ends_at', other_begins_at: I18n.l(ends_at_overlap.begins_at, format: :long)))
      end
      if begins_at_overlap.present?
        errors.add(:begins_at, I18n.t('activerecord.errors.models.reservation.attributes.begins_at', other_ends_at: I18n.l(begins_at_overlap.ends_at, format: :long)))
      end
    end
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

  def trigger_update_infoscreens
    WebsocketRails[('infoscreens_' + self.organisation.id.to_s).to_sym].trigger 'update'
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
