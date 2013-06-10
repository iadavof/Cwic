class CreateOrganisationRoles < ActiveRecord::Migration
  def change
    create_table :organisation_roles do |t|
      t.string :name

      t.timestamps
    end
  end
end
