class AddSlackMinutesToReservation < ActiveRecord::Migration
  def change
    add_column :reservations, :slack_before, :integer
    add_column :reservations, :slack_after, :integer
  end
end
