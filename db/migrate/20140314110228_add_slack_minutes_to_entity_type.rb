class AddSlackMinutesToEntityType < ActiveRecord::Migration
  def change
    add_column :entity_types, :slack_before, :integer, default: 0
    add_column :entity_types, :slack_after, :integer, default: 0
  end
end
