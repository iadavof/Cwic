class CreateDayOccupations < ActiveRecord::Migration
  def change
    create_table :day_occupations do |t|
      t.references :organisation, index: true
      t.date :day
      t.float :occupation

      t.timestamps
    end
  end
end
