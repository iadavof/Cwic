class AddIndexToPropertyType < ActiveRecord::Migration
  def change
    add_column :property_types, :index, :integer, default: 0
  end
end
