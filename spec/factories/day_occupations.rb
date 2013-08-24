# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :day_occupation do
    organisation nil
    day "2013-08-24"
    occupation 1.5
  end
end
