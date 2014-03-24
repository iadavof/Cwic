# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :reservation_rule_scope_span do
    scope nil
    year_from 1
    month_from 1
    week_from 1
    holiday_from "MyString"
    dom_from 1
    nrom_from 1
    dow_from 1
    hour_from 1
    minute_from 1
    year_to 1
    month_to 1
    week_to 1
    holiday_to "MyString"
    dom_to 1
    nrom_to 1
    dow_to 1
    hour_to 1
    minute_to 1
  end
end
