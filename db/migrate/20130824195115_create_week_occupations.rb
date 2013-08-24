class CreateWeekOccupations < ActiveRecord::Migration
  def change
    create_table :week_occupations do |t|
      t.references :organisation, index: true
      t.integer :week
      t.integer :year
      t.float :occupation

      t.timestamps
    end
  end
end
