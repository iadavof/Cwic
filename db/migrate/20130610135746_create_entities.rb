class CreateEntities < ActiveRecord::Migration
  def change
    create_table :entities do |t|
      t.references :organisation, index: true
      t.references :entity_type, index: true
      t.string :name
      t.text :description

      t.timestamps
    end
  end
end
