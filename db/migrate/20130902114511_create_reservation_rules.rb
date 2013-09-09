class CreateReservationRules < ActiveRecord::Migration
  def change
    create_table :reservation_rules do |t|
      t.references :entity, index: true
      t.datetime :active_from
      t.datetime :active_to
      t.references :period_unit, index: true
      t.integer :period_amount, default: 1
      t.integer :min_periods, default: 1
      t.integer :max_periods
      t.decimal :price, precision: 16, scale: 2, default: 0.00

      t.timestamps
    end
  end
end
