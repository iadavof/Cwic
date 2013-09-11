class Reservation < ActiveRecord::Base
  include DatetimeSplittable
  include I18n::Alchemy

  belongs_to :organisation_client
  belongs_to :entity
  belongs_to :organisation
  has_many :stickies, as: :stickable, dependent: :destroy

  validates :begins_at, presence: true
  validates :ends_at, presence: true, date_after: { date: :begins_at, date_error_format: :long }
  validates :entity, presence: true
  validates :organisation_client, presence: true
  validate :not_overlapping

  split_datetime :begins_at, :ends_at
  after_save :trigger_occupation_recalculation
  after_destroy :trigger_occupation_recalculation

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

  def instance_name
    "#{self.class.model_name.human} ##{self.id.to_s}"
  end

private
  def not_overlapping
    if entity.present?
      ends_at_overlap = entity.reservations.where('begins_at < :ends_at AND :ends_at < ends_at', ends_at: ends_at).first
      begins_at_overlap = entity.reservations.where('begins_at < :begins_at AND :begins_at < ends_at', begins_at: begins_at).first
      if ends_at_overlap.present?
        errors.add(:ends_at, I18n.t('activerecord.errors.models.reservation.attributes.ends_at', other_begins_at: I18n.l(ends_at_overlap.begins_at, format: :long)))
      end
      if begins_at_overlap.present?
        errors.add(:begins_at, I18n.t('activerecord.errors.models.reservation.attributes.begins_at', other_ends_at: I18n.l(begins_at_overlap.ends_at, format: :long)))
      end
    end
  end

  def occupation_recalculation_needed?
    return self.destroyed? || self.begins_at_was.nil? || self.ends_at.nil? || self.begins_at_was != self.begins_at || self.ends_at_was != self.ends_at
  end

  def trigger_occupation_recalculation
    # Note: this code could be more optimized for updates (for example, when we move a reservation in the same day, then no recalculations are necessary)
    # Check if something has changed, if so, perform occupation recalculation.
    if occupation_recalculation_needed?
      if self.begins_at_was.present? && self.ends_at_was.present?
        days = (self.begins_at_was.to_date..self.ends_at_was.to_date)
        DayOccupation.recalculate_occupations(self.entity, days)
        WeekOccupation.recalculate_occupations(self.entity, Week.from_date(days.min)..Week.from_date(days.max))
      end

      unless self.destroyed?
        days = (self.begins_at.to_date..self.ends_at.to_date)
        DayOccupation.recalculate_occupations(self.entity, days)
        WeekOccupation.recalculate_occupations(self.entity, Week.from_date(days.min)..Week.from_date(days.max))
      end
    end
  end

  def trigger_occupation_recalculation_old
    recalculation_dates = []

    # Old values
    if self.begins_at_was.present? && self.ends_at_was.present?
      if self.begins_at_was.to_date != self.begins_at.to_date || self.ends_at_was.to_date != self.ends_at.to_date
        start_date = self.begins_at_was.to_date
        while start_date <= self.ends_at_was.to_date
          recalculation_dates << start_date
          start_date += 1.day
        end
      end
    end

    start_date = self.begins_at.to_date
    while start_date <= self.ends_at.to_date
      unless recalculation_dates.include?(start_date)
        recalculation_dates << start_date
      end
      start_date += 1.day
    end

    DayOccupation.recalculate_occupations(self.entity, recalculation_dates)
    WeekOccupation.recalculate_occupations(self.entity, recalculation_dates)
  end
end
