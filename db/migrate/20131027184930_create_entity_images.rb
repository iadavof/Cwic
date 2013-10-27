class CreateEntityImages < ActiveRecord::Migration
  def change
    create_table :entity_images do |t|
      t.string :title
      t.references :entity_imageable, index: true
      t.string :entity_imageable_type
      t.references :organisation, index: true
      t.string :image

      t.timestamps
    end
  end
end
