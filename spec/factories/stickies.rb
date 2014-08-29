# Note: this factory is used by the SeedHelper
FactoryGirl.define do
  factory :sticky do
    organisation
    stickable   { create(:entity, organisation: organisation) }
    user        { create(:user, organisation: organisation) }

    sticky_text { Forgery(:lorem_ipsum).words(5 + rand(50)) }
  end
end
