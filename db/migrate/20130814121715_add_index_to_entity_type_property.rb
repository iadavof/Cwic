class AddIndexToEntityTypeProperty < ActiveRecord::Migration
  def change
    add_column :entity_type_properties, :index, :integer, default: 0
  end
end
