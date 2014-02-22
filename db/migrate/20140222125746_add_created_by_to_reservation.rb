class AddCreatedByToReservation < ActiveRecord::Migration
  def change
    add_reference :reservations, :created_by, index: true
  end
end
