json.entities @entities.each do |e|
  json.id e.id

  current = e.reservations.now.first
  if current
    json.current_reservation do |json|
      json.partial! 'reservation', reservation: current
    end
  end

  today = e.reservations.future.past_or_now(Date.today.end_of_day)
  json.reservations_today today, partial: 'reservation', as: :reservation

  tomorrow = e.reservations.future(Date.today.end_of_day).past_or_now(Date.tomorrow.end_of_day)
  json.reservations_tomorrow tomorrow, partial: 'reservation', as: :reservation
end
