# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :reserve_period do
    entity_type nil
    name "MyString"
    period_amount 1
    period_unit nil
    min_periods 1
    max_periods 1
    price "9.99"
  end
end
