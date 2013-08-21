class AddDefaultToEntityTypePropertyOption < ActiveRecord::Migration
  def change
    add_column :entity_type_property_options, :default, :boolean
  end
end
