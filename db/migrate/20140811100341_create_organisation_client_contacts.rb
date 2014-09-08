class CreateOrganisationClientContacts < ActiveRecord::Migration
  def change
    create_table :organisation_client_contacts do |t|
      t.references :organisation_client, index: true
      t.string :first_name
      t.string :infix
      t.string :last_name
      t.string :position
      t.string :route
      t.string :street_number
      t.string :postal_code
      t.string :locality
      t.string :country
      t.string :administrative_area_level_2
      t.string :administrative_area_level_1
      t.string :email
      t.string :phone
      t.string :mobile_phone
      t.text :note

      t.timestamps
    end
  end
end
