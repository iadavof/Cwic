class RemoveFeedbackAndScreencaps < ActiveRecord::Migration
  def change
      drop_table :feedback_and_screencaps
  end
end
