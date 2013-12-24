class AddRepetitionKeyToTimeUnit < ActiveRecord::Migration
  def change
    add_column :time_units, :repetition_key, :string
  end
end
