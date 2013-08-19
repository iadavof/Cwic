class AddEntityTypeIconToEntityType < ActiveRecord::Migration
  def change
    add_reference :entity_types, :entity_type_icon, index: true
  end
end
