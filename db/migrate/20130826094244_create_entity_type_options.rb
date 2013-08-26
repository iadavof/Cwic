class CreateEntityTypeOptions < ActiveRecord::Migration
  def change
    create_table :entity_type_options do |t|
      t.references :entity_type, index: true
      t.string :name
      t.text :description
      t.decimal :default_price
      t.integer :index

      t.timestamps
    end
  end
end
