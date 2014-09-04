json.settings do |json|
  json.direction_char_visible @info_screen.direction_char_visible
  json.clock_header @info_screen.clock_header
end

json.reservations @reservations do |r|
  json.entity_id r.entity.id
  json.entity_name r.entity.frontend_name
  json.id r.id
  json.color r.entity.color
  json.begin_moment r.begins_at.strftime('%Y-%m-%d %H:%M')
  json.begin_unix r.begins_at.to_i
  json.end_moment r.ends_at.strftime('%Y-%m-%d %H:%M')
  json.end_unix r.ends_at.to_i
  json.description r.full_instance_name(number: @info_screen.show_reservation_number || r.description.blank?, client: false)
  json.direction_char @active_ises.detect { |ise| ise.entity_id == r.entity_id }.direction_char
end
