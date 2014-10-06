class AddDefaultToReservationStatus < ActiveRecord::Migration
  def change
    add_column :reservation_statuses, :default_status, :boolean, default: false
  end
end
