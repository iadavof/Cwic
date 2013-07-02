class AddColorToEntityType < ActiveRecord::Migration
  def change
    add_column :entity_types, :color, :string, default: '#FF3520'
  end
end
