class CreateReservationRules < ActiveRecord::Migration
  def change
    create_table :reservation_rules do |t|
      t.references :scope, index: true
      t.string :reserve_by
      t.references :period_unit, index: true
      t.integer :period_amount
      t.integer :min_periods
      t.integer :max_periods
      t.decimal :price, precision: 16, scale: 2
      t.string :price_per
      t.references :price_period_unit, index: true
      t.integer :price_period_amount

      t.timestamps
    end
  end
end
