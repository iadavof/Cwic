class CreateReservePeriods < ActiveRecord::Migration
  def change
    create_table :reservation_periods do |t|
      t.references :entity_type, index: true
      t.string :name
      t.integer :period_amount
      t.references :period_unit, index: true
      t.decimal :price

      t.timestamps
    end
  end
end
