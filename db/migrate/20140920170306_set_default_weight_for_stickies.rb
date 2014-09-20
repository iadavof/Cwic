class SetDefaultWeightForStickies < ActiveRecord::Migration
  def change
    change_column :stickies, :weight, :integer, default: 0
  end
end
