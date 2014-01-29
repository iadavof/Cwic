class AddBaseReservationToReservation < ActiveRecord::Migration
  def change
    add_reference :reservations, :base_reservation, index: true
  end
end
