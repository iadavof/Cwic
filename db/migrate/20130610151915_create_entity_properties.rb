class CreateEntityProperties < ActiveRecord::Migration
  def change
    create_table :entity_properties do |t|
      t.references :entity, index: true
      t.references :entity_type_property, index: true
      t.text :value

      t.timestamps
    end
  end
end
