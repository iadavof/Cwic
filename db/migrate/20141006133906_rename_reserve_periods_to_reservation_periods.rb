class RenameReservePeriodsToReservationPeriods < ActiveRecord::Migration
  def change
    rename_table :reserve_periods, :reservation_periods
  end
end
