class CreateFrontends < ActiveRecord::Migration
  def change
    create_table :frontends do |t|
      t.references :organisation, index: true
      t.string :name
      t.boolean :add_new_entity_types
    end
  end
end
