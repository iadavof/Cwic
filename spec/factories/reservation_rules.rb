# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :reservation_rule do
    entity nil
    time_unit "MyString"
    min_length 1
    max_length 1
    active_from_date "2013-09-02"
    active_to_date "2013-09-02"
    active_from_time "2013-09-02 13:45:11"
    active_to_time "2013-09-02 13:45:11"
    active_days "MyString"
    price "9.99"
  end
end
