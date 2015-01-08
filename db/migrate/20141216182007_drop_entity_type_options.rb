class DropEntityTypeOptions < ActiveRecord::Migration
  def change
    drop_table :entity_type_options do |t|
      t.references :entity_type
      t.string :name
      t.text :description
      t.decimal :default_price, precision: 16, scale: 2, default: 0.0
      t.integer :index
      t.boolean :amount_relevant, default: false
      t.timestamps
    end
  end
end
