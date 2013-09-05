class CreateStickies < ActiveRecord::Migration
  def change
    create_table :stickies do |t|
      t.references :stickable, index: true
      t.references :user, index: true
      t.text :sticky_text
      t.float :pos_x
      t.float :pos_y
      t.float :width
      t.float :height

      t.timestamps
    end
  end
end
