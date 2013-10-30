class CreateInfoScreens < ActiveRecord::Migration
  def change
    create_table :info_screens do |t|
      t.string :name
      t.boolean :public

      t.timestamps
    end
  end
end
