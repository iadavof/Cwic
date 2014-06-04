class AddMinMaxLengthToEntityType < ActiveRecord::Migration
  def change
    add_column :entity_types, :min_reservation_length, :integer
    add_column :entity_types, :max_reservation_length, :integer
  end
end
