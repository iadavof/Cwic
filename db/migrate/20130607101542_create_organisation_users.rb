class CreateOrganisationUsers < ActiveRecord::Migration
  def change
    create_table :organisation_users do |t|
      t.references :organisation, index: true
      t.references :user, index: true
      t.references :organisation_role, index: true

      t.timestamps
    end
  end
end
