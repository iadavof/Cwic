class RenameEntityTypeIcon < ActiveRecord::Migration
  def change
    rename_column :entity_types, :entity_type_icon_id, :icon_id
  end
end
