class AddDefaultToPropertyTypeOption < ActiveRecord::Migration
  def change
    add_column :property_type_options, :default, :boolean
  end
end
