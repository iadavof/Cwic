class AddDirectionCharVisibleToInfoScreens < ActiveRecord::Migration
  def change
    add_column :info_screens, :direction_char_visible, :boolean, default: true
  end
end
