class AddSlackMinutesToEntity < ActiveRecord::Migration
  def change
    add_column :entities, :slack_before, :integer
    add_column :entities, :slack_after, :integer
  end
end
