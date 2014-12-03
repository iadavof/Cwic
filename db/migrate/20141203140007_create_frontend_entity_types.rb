class CreateFrontendEntityTypes < ActiveRecord::Migration
  def change
    create_table :frontend_entity_types do |t|
      t.references :frontend, index: true
      t.references :entity_type, index: true
      t.boolean :active
      t.boolean :add_new_entities
    end
  end
end
