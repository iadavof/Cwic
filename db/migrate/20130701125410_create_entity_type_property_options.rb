class CreateEntityTypePropertyOptions < ActiveRecord::Migration
  def change
    create_table :entity_type_property_options do |t|
      t.references :entity_type_property, index: true
      t.string :name

      t.timestamps
    end
  end
end
