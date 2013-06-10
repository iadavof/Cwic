# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :data_type do
    key "MyString"
    rails_type "MyString"
    form_type "MyString"
  end
end
