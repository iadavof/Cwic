class AddRequiredToEntityTypeProperty < ActiveRecord::Migration
  def change
    add_column :entity_type_properties, :required, :boolean, default: false, after: :data_type_id
  end
end
