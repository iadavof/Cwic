# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :reservation_log do
    user nil
    reservation nil
  end
end
