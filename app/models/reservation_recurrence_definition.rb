class ReservationRecurrenceDefinition < ActiveRecord::Base

	include I18n::Alchemy

	has_no_table

	belongs_to :reservation

	column :reservation_id, :references

	column :repeating, :boolean
	column :repeating_unit, :string
	column :repeating_every, :integer
	column :repeating_until, :string
	column :repeating_instances, :integer


	def apply_recurrence

		# If we are not repeating, there is nothing to do
		if !self.repeating
			return
		end

	end

	def repetition_units
		{
			daily: I18n.t('reservation_recurrence_definitions.repetition_units.daily'),
			weekly: I18n.t('reservation_recurrence_definitions.repetition_units.weekly'),
			monthly: I18n.t('reservation_recurrence_definitions.repetition_units.monthly'),
			yearly: I18n.t('reservation_recurrence_definitions.repetition_units.yearly'),
		}
	end

	def repetition_every_choises
		(1..30).to_a.map { |value| [ value, value ] }
	end
end