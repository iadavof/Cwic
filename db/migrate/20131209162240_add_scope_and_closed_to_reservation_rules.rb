class AddScopeAndClosedToReservationRules < ActiveRecord::Migration
  def change
    add_reference :reservation_rules, :scope, after: :entity_id, index: true
    add_column :reservation_rules, :closed, :boolean, after: :scope_id
  end
end
