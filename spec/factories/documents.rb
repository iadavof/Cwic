# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :document do
    organisation nil
    user nil
    document "MyString"
  end
end
