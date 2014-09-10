json.entity_types @entity_types.each do |et|
  json.id et.id

  json.entities et.entities.each do |e|
    json.id e.id
    current = e.reservations.by_date_domain(Time.now, Time.now).first
    if current
      json.current_reservation do |json|
        json.extract! current, :id, :full_instance_name, :begins_at, :ends_at, :description if current.present?
      end
    end

    json.reservations_today e.reservations.by_date_domain(Time.now, Time.now.end_of_day, { ignore_reservations: [current.try(:id)] }).each do |r|
      json.extract! r, :id, :full_instance_name, :begins_at, :ends_at
    end

    json.reservations_tomorrow e.reservations.by_date_domain(Time.now + 1.day, Time.now.end_of_day + 1.day, { ignore_reservations: [current.try(:id)] }).each do |r|
      json.extract! r, :id, :full_instance_name, :begins_at, :ends_at
    end
  end
end
