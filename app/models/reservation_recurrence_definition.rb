class ReservationRecurrenceDefinition < ActiveRecord::Base

	include I18n::Alchemy

	has_no_table

	belongs_to :reservation

	column :reservation_id, :references

	column :repeating, :boolean
	column :repeating_unit_id, :integer
	column :repeating_every, :integer
	column :repeating_until, :string
	column :repeating_instances, :integer


	def apply_recurrence

		# If we are not repeating, there is nothing to do
		if !self.repeating
			return
		end

	end

	def repeating_units
		TimeUnit.where(key: [:day, :week, :month, :year])
	end

	def repetition_every_choises
		(1..30).to_a.map { |value| [ value, value ] }
	end
end