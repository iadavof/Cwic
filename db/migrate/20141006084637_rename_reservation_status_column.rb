class RenameReservatioonStatusColumn < ActiveRecord::Migration
  def change
    rename_column :reservations, :reservation_status_id, :status_id
  end
end
