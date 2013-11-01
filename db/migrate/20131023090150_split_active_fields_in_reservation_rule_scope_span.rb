class SplitActiveFieldsInReservationRuleScopeSpan < ActiveRecord::Migration
  def change
    change_table :reservation_rule_scope_spans do |t|
      t.remove :active_from, :active_to
      t.integer :year_from, :month_from, :dom_from, :week_from, :dow_from, :hour_from, :minute_from
      t.integer :year_to, :month_to, :dom_to, :week_to, :dow_to, :hour_to, :minute_to
    end
  end
end
