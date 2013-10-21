class CreateReservationRuleScopeSpans < ActiveRecord::Migration
  def change
    create_table :reservation_rule_scope_spans do |t|
      t.references :scope, index: true
      t.datetime :active_from
      t.datetime :active_to

      t.timestamps
    end
  end
end
