# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :organisation_user do
    organisation nil
    user nil
    organisation_role nil
  end
end
