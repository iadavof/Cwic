# Let op: deze factory wordt ook gebruikt door de SeedHelper
FactoryGirl.define do
  factory :reservation do
    organisation
    organisation_client { create(:organisation_client, organisation: organisation) }
    entity              { create(:entity, organisation: organisation) }

    # Begins several hours after the last reservation or begin at the beginning of this week
    begins_at           { (entity.reservations.reorder(ends_at: :desc).first.try(:ends_at) || DateTime.now.beginning_of_week) + rand(72).hours }
    ends_at             { begins_at + 1.hour + (rand(12) / 2.0).hours }
    description         { (amount = rand(5)) > 0 ? Forgery(:lorem_ipsum).words(amount) : nil }
  end
end
