# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :entity_image do
    title "MyString"
    entity_imageable nil
    entity_imageable_type "MyString"
    organisation nil
    image "MyString"
  end
end
