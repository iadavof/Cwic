class WeekOccupation < ActiveRecord::Base
  include I18n::Alchemy

  belongs_to :entity

  validates :entity, presence: true
  validates :week, presence: true, numericality: { only_integer: true }
  validates :year, presence: true, numericality: { only_integer: true }
  validates :occupation, presence: true, numericality: true

  def instance_name
    self.week
  end

  def self.recalculate_occupations(entity, dates)
    occupations = []
    weeks = []

    puts dates.inspect

    dates.each do |date|
      #%V - Week number of the week-based year (01..53)
      week = { number: date.strftime('%V').to_i, year: date.strftime('%G').to_i }
      unless weeks.include?(week)
        weeks << week
      end
    end

    puts weeks.inspect

    weeks.each do |week|
      occupation_length = 0

      entity.week_occupations.where('week = :week AND year = :year', week: week[:number], year: week[:year]).delete_all

      start_at = Date.commercial(week[:year], week[:number]);
      end_at = start_at + 7.days
      reservations = entity.reservations.where("begins_at < :ends_at AND ends_at > :begins_at", begins_at: start_at, ends_at: end_at)
        puts start_at.inspect
        puts end_at.inspect

      while start_at < end_at
        occupation_length += reservations.map { |r| r.length_for_day(start_at) }.sum
        start_at += 1.day
      end

      occupation_percent = (occupation_length.to_f / (86400 * 7)) * 100
      occupations << { entity: entity, week: week[:number], year: week[:year], occupation: occupation_percent } if occupation_percent > 0
    end
    WeekOccupation.create(occupations)
  end
end
