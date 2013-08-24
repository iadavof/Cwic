class CreateFeedbackandscreencapTables < ActiveRecord::Migration
  def self.up
    
   create_table :feedback_and_screencaps do |t|
      t.string :message
      t.binary :screencap

      t.timestamps
    end

    add_index :feedback_and_screencaps, [:message]


  end

  def self.down
    drop_table :feedback_and_screencaps
  end
end