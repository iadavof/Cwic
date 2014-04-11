class CreateTimeUnits < ActiveRecord::Migration
  def change
    create_table :time_units do |t|
      t.string :key
      t.integer :seconds

      t.timestamps
    end
  end
end
