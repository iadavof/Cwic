class RenameEntityImageableToImageableInEntityImages < ActiveRecord::Migration
  def change
    rename_column :entity_images, :entity_imageable_id, :imageable_id
    rename_column :entity_images, :entity_imageable_type, :imageable_type
  end
end
