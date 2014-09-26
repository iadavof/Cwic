class RemoveCommonFromTimeUnit < ActiveRecord::Migration
  def change
    remove_column :time_units, :common, :string
  end
end
