class CreateReservations < ActiveRecord::Migration
  def change
    create_table :reservations do |t|
      t.datetime :begins_at
      t.datetime :ends_at
      t.references :entity, index: true
      t.references :organisation, index: true
      t.references :organisation_client, index: true

      t.timestamps
    end
  end
end
