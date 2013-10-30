class CreateInfoScreenEntities < ActiveRecord::Migration
  def change
    create_table :info_screen_entities do |t|
      t.string :direction_char
      t.references :info_screens_entity_type, index: true
      t.references :entity, index: true

      t.timestamps
    end
  end
end
