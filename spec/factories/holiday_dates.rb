# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :holiday_date do
    holiday nil
    date "2014-04-28"
  end
end
