class CreateReservationRuleScopeSpans < ActiveRecord::Migration
  def change
    create_table :reservation_rule_scope_spans do |t|
      t.references :scope, index: true
      t.integer :year_from
      t.integer :month_from
      t.integer :week_from
      t.string :holiday_from
      t.integer :dom_from
      t.integer :nrom_from
      t.integer :dow_from
      t.integer :hour_from
      t.integer :minute_from
      t.integer :year_to
      t.integer :month_to
      t.integer :week_to
      t.string :holiday_to
      t.integer :dom_to
      t.integer :nrom_to
      t.integer :dow_to
      t.integer :hour_to
      t.integer :minute_to

      t.timestamps
    end
  end
end
