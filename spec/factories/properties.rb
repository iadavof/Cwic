# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :property do
    entity nil
    property_type nil
    value "MyText"
  end
end
