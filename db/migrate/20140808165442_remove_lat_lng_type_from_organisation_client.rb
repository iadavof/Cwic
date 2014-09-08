class RemoveLatLngTypeFromOrganisationClient < ActiveRecord::Migration
  def change
    remove_column :organisation_clients, :lat
    remove_column :organisation_clients, :lng
    remove_column :organisation_clients, :address_type
  end
end
