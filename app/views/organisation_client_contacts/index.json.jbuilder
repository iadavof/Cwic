json.array!(@organisation_client_contacts) do |organisation_client_contact|
  json.extract! organisation_client_contact, :id, :instance_name, :position
  json.url organisation_organisation_client_organisation_client_contact_url(@organisation, @organisation_client, organisation_client_contact, format: :json)
end
