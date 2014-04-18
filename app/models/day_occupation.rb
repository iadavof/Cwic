# Note: delete_all is used in recalculate_occupations, so destroy callbacks will not be called.
class DayOccupation < ActiveRecord::Base
  belongs_to :entity

  validates :entity, presence: true
  validates :day, presence: true
  validates :occupation, presence: true, numericality: true

  def instance_name
    self.day
  end

  # Recalculates all occupations in days range for the given entity
  def self.recalculate_occupations(entity, days)
    # Delete all old occupations
    entity.day_occupations.where(day: days).delete_all

    # Get all potential relevant reservations
    reservations = entity.reservations.where("begins_at < :max AND ends_at > :min", min: days.min, max: (days.max + 1.day)).to_a

    # Determine new occupations
    occupations = []
    days.each do |day|
      matches = reservations.select { |r| r.begins_at < (day + 1.day) && r.ends_at > day } # Get relevant reservations for this day
      occupation_length = matches.map { |r| r.length_for_day(day) }.sum # Calculate the total time for all reservations on this day
      occupation_percent = (occupation_length.to_f / 1.day.to_i) * 100 # Translate it to a percentage
      occupations << DayOccupation.new(entity: entity, day: day, occupation: occupation_percent) if occupation_percent > 0 # And add the row
    end

    # Finally insert all occupations
    DayOccupation.import(occupations)
  end
end
