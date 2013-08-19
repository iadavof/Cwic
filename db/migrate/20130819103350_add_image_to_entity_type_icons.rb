class AddImageToEntityTypeIcons < ActiveRecord::Migration
  def change
    add_column :entity_type_icons, :image, :string
  end
end
