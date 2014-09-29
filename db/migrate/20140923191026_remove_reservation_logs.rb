class RemoveReservationLogs < ActiveRecord::Migration
  def change
  	drop_table :reservation_logs
  end
end
