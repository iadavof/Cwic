class MoveColorFromEntityTypeToEntity < ActiveRecord::Migration
  def change
    add_column :entities, :color, :string, default: '#FF3520'
    remove_column :entity_types, :color
  end
end
