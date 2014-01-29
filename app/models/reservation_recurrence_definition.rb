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

	column :repeating_until, :string
	column :repeating_instances, :integer

	validates :reservation, presence: true
	#validates :reservation_unit, presence: true
	validates :repeating_every, numericality: { greater_than_or_equal_to: 1 }
	validates :repeating_instances, numericality: { greater_than_or_equal_to: 1 }, allow_blank: true
	#validates_date :repeating_until, after: self.reservation.begins_at

	def generate_recurrences
		# If we are not repeating, there is nothing to do
		if !self.repeating
			return
		else
			schedule = IceCube::Schedule.new(self.reservation.begins_at)

			schedule_rule = IceCube::Rule.send(self.repeating_unit.repetition_key, self.repeating_every)

			if self.repeating_unit == :weekly && self.repeating_weekdays.present?
				schedule_rule.day(self.repeating_weekdays)
			end

			if self.repeating_unit == :monthly && self.repeating_monthdays.present?
				schedule_rule.day(self.repeating_monthdays)
			end

			# Apply constructed schedule rule
			schedule.add_recurrence_rule schedule_rule


			# Get the requested occurences
			if self.repeating_until.present?
				recurrence_dates = schedule.occurrences DateTime.strptime(self.repeating_until, I18n.t("date.formats.default"))
			elsif(self.repeating_instances.present?)
				recurrence_dates = schedule.first(self.repeating_instances)
			end

			clone_reservation(recurrence_dates)
		end
	end

	def save_recurrances(recurrences)
			unless recurrences.empty?
				# There are recurernces, set base_reservation for original reservation
				self.reservation.base_reservation = self.reservation
				self.save
				recurrences.map { |r| r.save }
			end
	end

	def validate_recurrences
		invalid_recurrences = []
		recurrences.each do |r|
			unless recurrences.valid?
				invalid_recurrences << r
			end
		end
		invalid_recurrences.empty?
	end

	def apply_recurrence
		recurrences = generate_recurrences
	end

	def clone_reservation(recurrence_dates)
		reservation_length = self.reservation.total_length

		# Remove the first recurrence because this is the original reservation which is already saved
		recurrence_dates.shift

		new_reservations = []
		recurrence_dates.each do |starts_at|
			new_reservation = self.reservation.dup
			new_reservation.begins_at = starts_at
			new_reservation.ends_at = starts_at + reservation_length.seconds
			new_reservation.base_reservation = self.reservation
			new_reservation.reservation_recurrence_definition = nil
			new_reservations << new_reservation
		end
		
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
			OpenStruct.new(key: :monday, human_name: current_locale_daynames[1]),
			OpenStruct.new(key: :tuesday, human_name: current_locale_daynames[2]),
			OpenStruct.new(key: :wednesday, human_name: current_locale_daynames[3]),
			OpenStruct.new(key: :thursday, human_name: current_locale_daynames[4]),
			OpenStruct.new(key: :friday, human_name: current_locale_daynames[5]),
			OpenStruct.new(key: :saturday, human_name: current_locale_daynames[6]),
			OpenStruct.new(key: :sunday, human_name: current_locale_daynames[0]),
		]
	end

end