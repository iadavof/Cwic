class CreateHolidays < ActiveRecord::Migration
  def change
    create_table :holidays do |t|
      t.string :region
      t.string :key
      t.string :gem_name
      t.integer :gem_offset

      t.timestamps
    end
  end
end
