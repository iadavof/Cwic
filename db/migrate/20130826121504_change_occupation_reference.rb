class ChangeOccupationReference < ActiveRecord::Migration
  def change
    rename_column :day_occupations, :organisation_id, :entity_id
    rename_column :week_occupations, :organisation_id, :entity_id
  end
end
