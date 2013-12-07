class AddPhoneToOrganisationClient < ActiveRecord::Migration
  def change
    add_column :organisation_clients, :phone, :string
    add_column :organisation_clients, :mobile_phone, :string
  end
end
