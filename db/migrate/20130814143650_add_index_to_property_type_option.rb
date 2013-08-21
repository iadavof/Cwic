class AddIndexToPropertyTypeOption < ActiveRecord::Migration
  def change
    add_column :property_type_options, :index, :integer, default: 0
  end
end
