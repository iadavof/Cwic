# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :reserve_period do
    entity_type
    association :period_unit, factory: :time_unit
    name "TODO"
    price { rand(10000) / 100.to_f }
  end
end
