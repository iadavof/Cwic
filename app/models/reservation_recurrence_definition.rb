class ReservationRecurrenceDefinition < ActiveRecord::Base
	include I18n::Alchemy

	has_no_table database: :pretend_success

	belongs_to :reservation
	belongs_to :repeating_unit, class_name: 'TimeUnit'

	column :reservation_id, :references
	column :repeating_unit_id, :references

	column :repeating, :boolean

	column :repeating_every, :integer
	column :repeating_weekdays, :array
	column :repeating_monthdays, :array

	column :repeating_end, :string
	column :repeating_until, :datetime
	column :repeating_instances, :integer

	validates :reservation, presence: true
	validates :repeating_unit, presence: true, if: :repeating?
	validates :repeating_every, numericality: { greater_than_or_equal_to: 1 }, if: :repeating?
	validates :repeating_end, presence: true, if: :repeating?
	validates :repeating_instances, presence: true, numericality: { greater_than_or_equal_to: 1 }, if: "self.repeating? && self.repeating_end == 'instances'"
	validates :repeating_until, presence: true, timeliness: { type: :date }, if: "self.repeating? && self.repeating_end == 'until'"
	validate :length_not_greater_than_repetition_unit, if: :repeating?
	validate :repeating_end_after_reservation_end, if: 'self.repeating? && self.repeating_until.present?'

	def generate_recurrences
		# If we are not repeating, there is nothing to do
		if !self.repeating
			return
		else
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
			@recurrences
		end
	end

	def save_recurrences
		unless @recurrences.blank?
			# There are recurernces, set base_reservation for original reservation
			self.reservation.base_reservation = self.reservation
			self.reservation.save
			@recurrences.map { |r| r.save }
		end
	end

	def check_invalid_recurrences
		invalid_recurrences = []
		if @recurrences
			@recurrences.each do |r|
				unless r.valid?
					invalid_recurrences << r
				end
			end
		end
		invalid_recurrences
	end

	def clone_reservation(recurrence_dates)
		reservation_length = self.reservation.total_length

		if recurrence_dates.first == self.reservation.begins_at
			# Remove the first recurrence because this is the original reservation which is already saved
			recurrence_dates.shift
		end

		new_reservations = []
		recurrence_dates.each do |starts_at|
			new_reservation = self.reservation.dup
			new_reservation.begins_at = starts_at
			new_reservation.ends_at = starts_at + reservation_length.seconds
			new_reservation.base_reservation = self.reservation
			new_reservation.reservation_recurrence_definition = nil
			new_reservations << new_reservation
		end
		new_reservations
	end

	def repeating_units
		TimeUnit.where(key: [:day, :week, :month, :year])
	end

	def repeating_every_choices
		(1..30).to_a.map { |value| [ value, value ] }
	end

	def repeating_monthdays_choices
		(1..31).to_a.map{ |nr| OpenStruct.new(key: nr, value: nr) }
	end

	def repeating_weekdays_choices
		current_locale_daynames = I18n.t(:"date.day_names")
		[
			OpenStruct.new(key: 1, human_name: current_locale_daynames[1]),
			OpenStruct.new(key: 2, human_name: current_locale_daynames[2]),
			OpenStruct.new(key: 3, human_name: current_locale_daynames[3]),
			OpenStruct.new(key: 4, human_name: current_locale_daynames[4]),
			OpenStruct.new(key: 5, human_name: current_locale_daynames[5]),
			OpenStruct.new(key: 6, human_name: current_locale_daynames[6]),
			OpenStruct.new(key: 7, human_name: current_locale_daynames[0]),
		]
	end

	def length_not_greater_than_repetition_unit
		return unless self.repeating_unit.present?

		reservation_length = self.reservation.total_length
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
