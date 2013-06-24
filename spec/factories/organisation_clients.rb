# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :organisation_client do
    first_name ""
    infix ""
    last_name ""
    email "MyString"
  end
end
