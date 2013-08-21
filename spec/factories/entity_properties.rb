# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :entity_property do
    entity nil
    entity_type_property nil
    value "MyText"
  end
end
