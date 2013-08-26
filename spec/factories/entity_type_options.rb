# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :entity_type_option do
    entity_type nil
    name "MyString"
    description "MyText"
    default_price "9.99"
    index 1
  end
end
