class CreatePropertyTypeOptions < ActiveRecord::Migration
  def change
    create_table :property_type_options do |t|
      t.references :property_type, index: true
      t.string :name

      t.timestamps
    end
  end
end
