class CreateEntityTypeIcons < ActiveRecord::Migration
  def change
    create_table :entity_type_icons do |t|
      t.string :name
      t.references :organisation, index: true

      t.timestamps
    end
  end
end
