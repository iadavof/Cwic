class RenameEntityTypePropertyInEntityProperties < ActiveRecord::Migration
  def change
    rename_column :entity_properties, :entity_type_property_id, :property_type_id
  end
end
