class DayOccupation < ActiveRecord::Base
  include I18n::Alchemy

  belongs_to :entity

  validates :entity, presence: true
  validates :day, presence: true
  validates :occupation, presence: true, numericality: true

  # Note: we use delete_all so destroy callbacks will not be called.

  def instance_name
    self.day
  end

  def self.recalculate_occupations(entity, dates)
    entity.day_occupations.where(day: dates).delete_all
    occupations = []
    dates.each do |date|
      reservations = entity.reservations.where("begins_at < :ends_at AND ends_at > :begins_at", begins_at: date, ends_at: date + 1.day)
      occupation_length = reservations.map { |r| r.length_for_day(date) }.sum
      occupation_percent = (occupation_length.to_f / 86400) * 100
      occupations << { entity: entity, day: date, occupation: occupation_percent } if occupation_percent > 0
    end
    DayOccupation.create(occupations)
  end
end
