class RenameOccupationToPercentageInOccupations < ActiveRecord::Migration
  def change
    rename_column :day_occupations, :occupation, :percentage
    rename_column :week_occupations, :occupation, :percentage
  end
end
