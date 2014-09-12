json.entities @reservations.group_by(&:entity_id).each do |entity_id, reservations|
  json.id entity_id

  current = reservations.detect(&:now?)
  if current
    json.current_reservation do |json|
      json.partial! 'reservation', reservation: current
    end
  end

  today = reservations.select { |r| r.future? && r.past_or_now?(Date.today.end_of_day) }
  json.reservations_today today, partial: 'reservation', as: :reservation

  tomorrow = reservations.select { |r| r.future?(Date.today.end_of_day) && r.past_or_now?(Date.tomorrow.end_of_day) }
  json.reservations_tomorrow tomorrow, partial: 'reservation', as: :reservation
end
