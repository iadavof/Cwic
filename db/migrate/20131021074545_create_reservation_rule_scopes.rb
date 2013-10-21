class CreateReservationRuleScopes < ActiveRecord::Migration
  def change
    create_table :reservation_rule_scopes do |t|
      t.references :entity, index: true
      t.string :name
      t.references :repetition_unit, index: true
      t.string :ancestry, index: true

      t.timestamps
    end
  end
end
