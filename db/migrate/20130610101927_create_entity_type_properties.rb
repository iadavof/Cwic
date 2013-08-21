class CreateEntityTypeProperties < ActiveRecord::Migration
  def change
    create_table :entity_type_properties do |t|
      t.references :entity_type, index: true
      t.string :name
      t.text :description
      t.references :data_type, index: true

      t.timestamps
    end
  end
end
