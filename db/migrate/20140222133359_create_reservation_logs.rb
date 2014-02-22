class CreateReservationLogs < ActiveRecord::Migration
  def change
    create_table :reservation_logs do |t|
      t.references :user, index: true
      t.references :reservation, index: true
      t.string :old_user_name
      t.timestamps
    end
  end
end
