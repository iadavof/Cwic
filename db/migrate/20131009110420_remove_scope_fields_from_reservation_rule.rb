class RemoveScopeFieldsFromReservationRule < ActiveRecord::Migration
  def change
    remove_column :reservation_rules, :active_from, :datetime
    remove_column :reservation_rules, :active_to, :datetime
  end
end
