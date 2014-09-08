class AddPaymentDetailsToOrganisationClient < ActiveRecord::Migration
  def change
    add_column :organisation_clients, :business_client, :boolean, default: false
    add_column :organisation_clients, :company_name, :string
    add_column :organisation_clients, :tax_number, :string
    add_column :organisation_clients, :iban, :string
    add_column :organisation_clients, :iban_att, :string
  end
end
