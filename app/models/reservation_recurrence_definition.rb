class ReservationRecurrenceDefinition < ActiveRecord::Base
  include I18n::Alchemy

  has_no_table database: :pretend_success

  # Associations
  belongs_to :reservation
  belongs_to :repeating_unit, class_name: 'TimeUnit'

  # Model definition
  column :reservation_id, :references
  column :repeating_unit_id, :references
  column :repeating, :boolean
  column :repeating_every, :integer
  column :repeating_weekdays, :array
  column :repeating_monthdays, :array
  column :repeating_end, :string
  column :repeating_until, :datetime
  column :repeating_instances, :integer
  attr_accessor :recurrences

  # Validations
  validates :reservation, presence: true
  validates :repeating_unit, presence: true, if: :repeating?
  validates :repeating_every, numericality: { greater_than_or_equal_to: 1 }, if: :repeating?
  validates :repeating_end, presence: true, if: :repeating?
  validates :repeating_instances, presence: true, numericality: { greater_than_or_equal_to: 1 }, if: -> { self.repeating? && self.repeating_end == 'instances' }
  validates :repeating_until, presence: true, timeliness: { type: :date }, if: -> { self.repeating? && self.repeating_end == 'until' }
  validate :length_not_greater_than_repetition_unit, if: :repeating?
  validate :repeating_end_after_reservation_end, if: -> { self.repeating? && self.repeating_until.present? }

  # Class methods

  def self.repeating_units
    TimeUnit.where(key: [:day, :week, :month, :year])
  end

  def self.repeating_monthdays_choices
    (1..31).map { |i| OpenStruct.new(key: i, value: i) }
  end

  def self.repeating_weekdays_choices
    (1..7).map { |i| OpenStruct.new(key: i, human_name: I18n.t(:"date.day_names")[i == 7 ? 0 : i]) }
  end

  # Instance methods

  def recurrences
    @recurrences ||= []
  end

  def recurrences?
    recurrences.any?
  end

  def generate_recurrences
    if self.repeating
      schedule = IceCube::Schedule.new(self.reservation.begins_at)

      schedule_rule = IceCube::Rule.send(self.repeating_unit.repetition_key, self.repeating_every)

      # Convert string arrays to integers
      self.repeating_weekdays = self.repeating_weekdays.reject(&:empty?).map(&:to_i)
      self.repeating_monthdays = self.repeating_monthdays.reject(&:empty?).map(&:to_i)

      if self.repeating_unit == :week && self.repeating_weekdays.present?
        schedule_rule.day(self.repeating_weekdays)
      end

      if self.repeating_unit == :month && self.repeating_monthdays.present?
        schedule_rule.day_of_month(self.repeating_monthdays)
      end

      # Apply constructed schedule rule
      schedule.add_recurrence_rule schedule_rule

      # Get the requested occurences
      if self.repeating_end == 'until'
        recurrence_dates = schedule.occurrences(self.repeating_until)
      else
        recurrence_dates = schedule.first(self.repeating_instances)
      end

      @recurrences = clone_reservation(recurrence_dates) if recurrence_dates.present?
    end
  end

  def save_recurrences
    recurrences.each do |r|
      r.base_reservation = reservation
      r.save!
    end
  end

  def invalid_recurrences
    recurrences.select { |r| r.invalid? }
  end

  private

  def clone_reservation(recurrence_dates)
    reservation_length = self.reservation.length

    if recurrence_dates.first == self.reservation.begins_at
      # Remove the first recurrence because this is the original reservation which is already saved
      recurrence_dates.shift
    end

    new_reservations = []
    recurrence_dates.each do |starts_at|
      new_reservation = self.reservation.dup
      new_reservation.begins_at = starts_at
      new_reservation.ends_at = starts_at + reservation_length.seconds
      new_reservation.reservation_recurrence_definition = nil
      new_reservations << new_reservation
    end
    new_reservations
  end

  def length_not_greater_than_repetition_unit
    return unless self.repeating_unit.present?

    reservation_length = self.reservation.length
    repeating_every = 1 if repeating_every.nil?

    if self.repeating_every * self.repeating_unit.seconds < reservation_length
      self.errors.add('', I18n.t('.activerecord.errors.models.reservation_recurrence_definition.recurrence_collides_with_itself'))
    end
  end

  def repeating_end_after_reservation_end
    if self.repeating_until < self.reservation.ends_at
      self.errors.add(:repeating_until, I18n.t('.activerecord.errors.models.reservation_recurrence_definition.repeating_until_before_end'))
    end
  end
end
