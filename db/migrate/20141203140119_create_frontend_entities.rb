class CreateFrontendEntities < ActiveRecord::Migration
  def change
    create_table :frontend_entities do |t|
      t.references :frontend_entity_type, index: true
      t.references :entity, index: true
      t.boolean :active
    end
  end
end
