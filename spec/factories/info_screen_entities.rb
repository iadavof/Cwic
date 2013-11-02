# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :info_screen_entity do
    direction_char "MyString"
    info_screen_entity_type nil
    entity nil
  end
end
