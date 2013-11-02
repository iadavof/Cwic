class ChangeInfoScreenEntityColumnName < ActiveRecord::Migration
  def change
  	rename_column :info_screen_entities, :info_screens_entity_type_id, :info_screen_entity_type_id
  end
end
