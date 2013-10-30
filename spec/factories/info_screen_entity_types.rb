# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :info_screen_entity_type do
    add_new_entities false
    info_screen nil
    entity_type nil
  end
end
