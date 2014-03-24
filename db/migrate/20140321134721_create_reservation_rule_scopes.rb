class CreateReservationRuleScopes < ActiveRecord::Migration
  def change
    create_table :reservation_rule_scopes do |t|
      t.references :scopeable, index: { name: :index_reservation_rule_scopes_on_scopeable }, polymorphic: true
      t.string :name
      t.references :repetition_unit
      t.string :span_type
      t.string :ancestry

      t.timestamps
    end
  end
end
