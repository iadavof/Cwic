# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :feedback do
    message "MyText"
    specs "MyText"
    screen_capture "MyString"
  end
end
