class AddAddNewEntityTypesToInfoScreens < ActiveRecord::Migration
  def change
    add_column :info_screens, :add_new_entity_types, :boolean
  end
end
