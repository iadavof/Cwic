class CreateFeedbacks < ActiveRecord::Migration
  def change
    create_table :feedbacks do |t|
      t.text :message
      t.text :specs
      t.string :screen_capture

      t.timestamps
    end
  end
end
