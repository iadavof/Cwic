class AddStatusToReservation < ActiveRecord::Migration
  def change
    add_reference :reservations, :reservation_status, index: true
  end
end
