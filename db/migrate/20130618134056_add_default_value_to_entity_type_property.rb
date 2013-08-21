class AddDefaultValueToEntityTypeProperty < ActiveRecord::Migration
  def change
    add_column :entity_type_properties, :default_value, :text
  end
end
