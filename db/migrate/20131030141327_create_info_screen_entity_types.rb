class CreateInfoScreenEntityTypes < ActiveRecord::Migration
  def change
    create_table :info_screen_entity_types do |t|
      t.boolean :add_new_entities
      t.references :info_screen, index: true
      t.references :entity_type, index: true

      t.timestamps
    end
  end
end
