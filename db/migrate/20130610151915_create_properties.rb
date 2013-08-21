class CreateProperties < ActiveRecord::Migration
  def change
    create_table :properties do |t|
      t.references :entity, index: true
      t.references :property_type, index: true
      t.text :value

      t.timestamps
    end
  end
end
