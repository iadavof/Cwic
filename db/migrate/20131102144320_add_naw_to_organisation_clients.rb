class AddNawToOrganisationClients < ActiveRecord::Migration
  def change
    add_column :organisation_clients, :route, :string
    add_column :organisation_clients, :street_number, :string
    add_column :organisation_clients, :postal_code, :string
    add_column :organisation_clients, :locality, :string
    add_column :organisation_clients, :country, :string
    add_column :organisation_clients, :administrative_area_level_2, :string
    add_column :organisation_clients, :administrative_area_level_1, :string
    add_column :organisation_clients, :address_type, :string
    add_column :organisation_clients, :lat, :float
    add_column :organisation_clients, :lng, :float
  end
end
