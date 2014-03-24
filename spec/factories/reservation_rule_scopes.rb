# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :reservation_rule_scope do
    scopeable nil
    type ""
    name "MyString"
    ancestry "MyString"
    active_array 1
  end
end
