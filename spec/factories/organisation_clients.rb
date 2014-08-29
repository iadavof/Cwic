# Note: this factory is used by the SeedHelper
FactoryGirl.define do
  factory :organisation_client do
    organisation

    first_name                  { Forgery(:name).first_name }
    last_name                   { Forgery(:name).last_name }
    email                       { Forgery(:email).address }
    route                       { Forgery(:address).street_address }
    street_number               { Forgery(:address).street_number }
    locality                    { Forgery(:address).city }
    administrative_area_level_2 { Forgery(:address).province }
    administrative_area_level_1 { Forgery(:address).state }
    country                     { Forgery(:address).country }
    postal_code                 { Forgery(:address).zip }
    phone                       { Forgery(:address).phone }
    mobile_phone                { Forgery(:address).phone }
  end
end
