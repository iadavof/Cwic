class CreateRealTimeFullScreens < ActiveRecord::Migration
  def change
    create_table :real_time_full_screens do |t|
      t.string :name
      t.boolean :public

      t.timestamps
    end
  end
end
