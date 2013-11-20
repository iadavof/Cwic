class AddHolidaysAndNromToReservationRuleScopeSpan < ActiveRecord::Migration
  def change
    add_column :reservation_rule_scope_spans, :holiday_from, :string, after: :dow_from
    add_column :reservation_rule_scope_spans, :nrom_from, :integer, after: :dom_from
    add_column :reservation_rule_scope_spans, :holiday_to, :string, after: :dow_to
    add_column :reservation_rule_scope_spans, :nrom_to, :integer, after: :dom_to
  end
end
