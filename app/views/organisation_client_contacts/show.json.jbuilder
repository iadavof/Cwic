json.address do |json|
  json.label OrganisationClientContact.human_attribute_name(:address)
  json.value format_address(@organisation_client_contact.route, @organisation_client_contact.street_number, @organisation_client_contact.postal_code, @organisation_client_contact.administrative_area_level_2, @organisation_client_contact.administrative_area_level_1, @organisation_client_contact.locality, @organisation_client_contact.country)
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
