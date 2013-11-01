class AddActiveToInfoScreenEntity < ActiveRecord::Migration
  def change
    add_column :info_screen_entities, :active, :boolean
  end
end
