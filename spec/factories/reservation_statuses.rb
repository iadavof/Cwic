# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :reservation_status do
    name "MyString"
    order 1
    color "MyString"
    entity_type nil
  end
end
