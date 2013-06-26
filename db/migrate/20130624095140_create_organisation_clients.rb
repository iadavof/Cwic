class CreateOrganisationClients < ActiveRecord::Migration
  def change
    create_table :organisation_clients do |t|
      t.string :first_name
      t.string :infix
      t.string :last_name
      t.string :email
      t.references :organisation, index: true

      t.timestamps
    end
  end
end
