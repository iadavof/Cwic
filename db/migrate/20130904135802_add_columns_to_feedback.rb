class AddColumnsToFeedback < ActiveRecord::Migration
  def change
    add_reference :feedbacks, :user, index: true
    add_reference :feedbacks, :organisation, index: true
  end
end
