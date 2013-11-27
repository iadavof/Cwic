class CreateReservationStatuses < ActiveRecord::Migration
  def change
    create_table :reservation_statuses do |t|
      t.string :name
      t.integer :index
      t.string :color
      t.references :entity_type, index: true

      t.timestamps
    end
  end
end
