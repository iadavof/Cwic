class AddCheckboxesToReservationStatus < ActiveRecord::Migration
  def change
    add_column :reservation_statuses, :blocking, :boolean, default: true
    add_column :reservation_statuses, :info_boards, :boolean, default: true
    add_column :reservation_statuses, :billable, :boolean, default: true
  end
end
