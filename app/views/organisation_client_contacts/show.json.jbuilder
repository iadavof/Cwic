json.vcard_url vcard_organisation_organisation_client_organisation_client_contact_path(@organisation, @organisation_client_contact.organisation_client, @organisation_client_contact)

json.list_items do |json|
  if format_address(@organisation_client_contact).present?
    json.address do |json|
      json.label OrganisationClientContact.human_attribute_name(:address)
      json.value format_address(@organisation_client_contact)
    end
  end

  if @organisation_client_contact.phone.present?
    json.phone do |json|
      json.label OrganisationClientContact.human_attribute_name(:phone)
      json.value @organisation_client_contact.phone
    end
  end

  if @organisation_client_contact.mobile_phone.present?
    json.mobile_phone do |json|
      json.label OrganisationClientContact.human_attribute_name(:mobile_phone)
      json.value @organisation_client_contact.mobile_phone
    end
  end

  if @organisation_client_contact.email.present?
    json.email do |json|
      json.label OrganisationClientContact.human_attribute_name(:email)
      json.value @organisation_client_contact.email
    end
  end

  if @organisation_client_contact.note.present?
    json.note do |json|
      json.label OrganisationClientContact.human_attribute_name(:note)
      json.value @organisation_client_contact.note
    end
  end
end
