# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :week_occupation do
    organisation nil
    week 1
    year 1
    occupation 1.5
  end
end
