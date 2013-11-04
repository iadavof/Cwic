class AddClockHeaderToInfoScreens < ActiveRecord::Migration
  def change
    add_column :info_screens, :clock_header, :boolean, default: true
  end
end
