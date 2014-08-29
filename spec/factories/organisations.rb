# Note: this factory is used by the SeedHelper
FactoryGirl.define do
  factory :organisation do
    name                        { Forgery(:name).company_name }
    route                       { Forgery(:address).street_address }
    street_number               { Forgery(:address).street_number }
    locality                    { Forgery(:address).city }
    administrative_area_level_2 { Forgery(:address).province }
    administrative_area_level_1 { Forgery(:address).state }
    country                     { Forgery(:address).country }
    postal_code                 { Forgery(:address).zip }
  end
end
