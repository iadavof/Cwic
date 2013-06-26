class AddRequiredToPropertyType < ActiveRecord::Migration
  def change
    add_column :property_types, :required, :boolean, default: false, after: :data_type_id
  end
end
