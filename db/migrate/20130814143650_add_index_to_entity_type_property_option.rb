class AddIndexToEntityTypePropertyOption < ActiveRecord::Migration
  def change
    add_column :entity_type_property_options, :index, :integer, default: 0
  end
end
