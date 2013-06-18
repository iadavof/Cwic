class AddDefaultValueToPropertyType < ActiveRecord::Migration
  def change
    add_column :property_types, :default_value, :text
  end
end
