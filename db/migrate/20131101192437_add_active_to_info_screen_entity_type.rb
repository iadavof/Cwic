class AddActiveToInfoScreenEntityType < ActiveRecord::Migration
  def change
    add_column :info_screen_entity_types, :active, :boolean
  end
end
