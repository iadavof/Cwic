class WeekOccupation < ActiveRecord::Base
  # Associations
  belongs_to :entity

  # Validations
  validates :entity, presence: true
  validates :week, presence: true, numericality: { only_integer: true }
  validates :year, presence: true, numericality: { only_integer: true }
  validates :percentage, presence: true, numericality: true

  # Note: delete_all is used in recalculate, so destroy callbacks will not be called.

  ##
  # Class methods
  ##

  # Recalculates all occupations in weeks range for the given entity
  def self.recalculate(entity, weeks)
    # Delete all old occupations
    entity.week_occupations.where('CONCAT(year, week) BETWEEN :min AND :max', min: weeks.min.to_s, max: weeks.max.to_s).delete_all

    # Get all potential relevant reservations
    reservations = entity.reservations.where("begins_at < :max AND ends_at > :min", min: weeks.min.to_begin_date, max: (weeks.max.to_end_date + 1.day)).to_a

     # Determine new occupations
    occupations = []
    weeks.each do |week|
      matches = reservations.select { |r| r.begins_at < (week.to_end_date + 1.day) && r.ends_at > week.to_begin_date } # Get relevant reservations for this week
      length = matches.map { |r| r.length_for_week(week) }.sum # Calculate the total time for all reservations in this week
      percentage = (length.to_f / 1.week.to_i) * 100 # Translate it to a percentage
      occupations << WeekOccupation.new(entity: entity, week: week.week, year: week.year, percentage: percentage) if percentage > 0 # And add the row
    end

    # Finally insert all occupations
    WeekOccupation.import(occupations)
  end

  ##
  # Instance methods
  ##

  def instance_name
    week
  end

  def nr
    week # The number in the container, in this case the number in the year
  end
end
