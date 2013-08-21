# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :entity_type_property do
    entity_type nil
    name "MyString"
    description "MyText"
    data_type nil
  end
end
