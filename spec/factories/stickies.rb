# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :sticky do
    stickable nil
    user nil
    sticky_text "MyText"
    pos_x 1.5
    pos_y 1.5
    width 1.5
    height 1.5
  end
end
