# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :reservation_rule_scope_span do
    scope nil
    year_from 1
    month_from 1
    day_from 1
    hour_from 1
    minute_from 1
    year_to 1
    month_to 1
    day_to 1
    hour_to 1
    minute_to 1
  end
end
