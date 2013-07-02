# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :property_type_option do
    property_type nil
    value "MyString"
    name "MyString"
  end
end
