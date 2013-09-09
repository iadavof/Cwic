class ChangeColumnsForStickies < ActiveRecord::Migration
  def change
    remove_column :stickies, :width
    remove_column :stickies, :height
    remove_column :stickies, :pos_x
    remove_column :stickies, :pos_y
    add_column :stickies, :weight, :integer
  end
end
