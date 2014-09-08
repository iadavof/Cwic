class CreateCommunicationRecords < ActiveRecord::Migration
  def change
    create_table :communication_records do |t|
      t.references :organisation_client, index: true
      t.references :user, index: true
      t.text :summary
      t.string :emotion
      t.string :method
      t.references :reservation, index: true
      t.references :contact

      t.timestamps
    end
  end
end
