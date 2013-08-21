# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :entity_type_property_option do
    entity_type_property nil
    value "MyString"
    name "MyString"
  end
end
