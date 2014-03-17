class AddWarningToReservation < ActiveRecord::Migration
  def change
    add_column :reservations, :warning, :boolean, default: false
  end
end
