class AddSpanSelectorToReservationRuleScope < ActiveRecord::Migration
  def change
    add_column :reservation_rule_scopes, :span_selector, :string
  end
end
