# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :reservation do
    begins_at ""
    ends_at ""
    entity ""
    organisation_client nil
  end
end
