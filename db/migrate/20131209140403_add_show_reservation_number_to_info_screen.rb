class AddShowReservationNumberToInfoScreen < ActiveRecord::Migration
  def change
    add_column :info_screens, :show_reservation_number, :boolean, default: false
  end
end
