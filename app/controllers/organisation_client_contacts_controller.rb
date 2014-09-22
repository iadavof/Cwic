class OrganisationClientContactsController < CrudController
  respond_to :json

  def vcard
    send_data(@organisation_client_contact.vcard.to_s, type: 'text/x-vcard', filename: @organisation_client_contact.vcard_filename)
  end

private
  def parent_model
    OrganisationClient
  end

  def collection_method
    :contacts
  end
end
