# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :reservation_rule do
    scope nil
    reserve_by "MyString"
    period_unit nil
    period_amount 1
    min_periods 1
    max_periods 1
    price "9.99"
    price_per "MyString"
    price_period_unit nil
    price_period_amount 1
  end
end
