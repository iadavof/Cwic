FactoryGirl.define do
  factory :organisation_client_contact do
    organisation_client

    first_name                  { Forgery(:name).first_name }
    last_name                   { Forgery(:name).last_name }
    email                       { Forgery(:email).address }
    position                    { Forgery(:name).job_title }
    route                       { Forgery(:address).street_address }
    street_number               { Forgery(:address).street_number }
    locality                    { Forgery(:address).city }
    administrative_area_level_2 { Forgery(:address).province }
    administrative_area_level_1 { Forgery(:address).state }
    country                     { Forgery(:address).country }
    postal_code                 { Forgery(:address).zip }
    phone                       { Forgery(:address).phone }
    mobile_phone                { Forgery(:address).phone }
    note                        { Forgery(:lorem_ipsum).words(30) }
  end
end
