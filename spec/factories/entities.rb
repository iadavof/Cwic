# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :entity do
    name "MyString"
    description "MyText"
    entity_type nil
    organisation nil
  end
end
