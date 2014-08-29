# Note: this factory is used by the SeedHelper
FactoryGirl.define do
  factory :reservation do
    organisation
    organisation_client { create(:organisation_client, organisation: organisation) }
    entity              { create(:entity, organisation: organisation) }
    begins_at           { build_begins_at(entity) }
    ends_at             { build_ends_at(entity, begins_at) }
    description         { (amount = rand(5)) > 0 ? Forgery(:lorem_ipsum).words(amount) : nil }
  end
end

# Gets a random begins_at such that it is after the last reservation (if present) and in the (near) future
def build_begins_at(entity)
  last_reservation = entity.reservations.where('ends_at >= ?', Time.zone.now).reorder(ends_at: :desc).first
  if last_reservation.present?
    last_reservation.ends_at + rand(72).hours
  else
    (Time.zone.now + 1.hour).beginning_of_hour
  end
end

# Gets a random ends_at (after the begins_at) such that the reservation's length matches the entity's reserve periods
def build_ends_at(entity, begins_at)
  reserve_periods = entity.reserve_periods.includes(:period_unit)
  if reserve_periods.empty?
    # The entity does not have any reserve periods: insert a temporary fake reserve period of a half hour to use for building the length
    reserve_periods = [build(:reserve_period, period_unit: TimeUnit.find_by!(key: 'half_hour'))]
  end

  # Determine minimum and maximum length we want to allow
  min_length = entity.min_reservation_length_seconds || 0
  if entity.max_reservation_length_seconds.present?
    max_length = entity.max_reservation_length_seconds # Use the defined maximum length
  else
    # The max length is 50 times the largest reserve period with a maximum of one year (for performance reasons)
    max_length = [reserve_periods.sort_by(&:length).last.length * 50, 1.year].min
  end

  desired_length = min_length + rand(max_length - min_length) # The desired length of the reservation we want to at least achieve. This is a random function that centers between the min and max length.

  # Build a length which is a combination of random reserve periods and is at least the desired length (and at most the maximum length)
  length = 0
  while length < desired_length do
    max_remaining_length = max_length - length # Determine the remaining length we can use
    reserve_period = reserve_periods.select { |rp| rp.length < max_remaining_length }.sample # Pick a random reserve period that does not exceed this length
    if reserve_period.present?
      length += reserve_period.length # Apply the reserve period
    else
      break # Stop building length if we cannot find a suitable reserve_period anymore
    end
  end

  begins_at + length
end
