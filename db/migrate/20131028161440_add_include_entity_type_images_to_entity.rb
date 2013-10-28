class AddIncludeEntityTypeImagesToEntity < ActiveRecord::Migration
  def change
    add_column :entities, :include_entity_type_images, :boolean, default: true
  end
end
