json.id reservation.id
json.begin_moment reservation.begins_at.strftime('%Y-%m-%d %H:%M')
json.end_moment reservation.ends_at.strftime('%Y-%m-%d %H:%M')
json.bg_color reservation.entity.color
json.text_color reservation.entity.text_color
json.blocking reservation.reservation_status.blocking if reservation.reservation_status.present?
json.description reservation.instance_name + (reservation.description.present? ? (': ' + reservation.description) : '') + ', ' + reservation.organisation_client.try(:instance_name).to_s
json.client_id reservation.organisation_client.try(:id)
json.entity_id reservation.entity.id
if reservation.reservation_status.present?
	json.status do |json|
		json.name reservation.reservation_status.name
		json.bg_color reservation.reservation_status.color
		json.text_color Cwic::Color.text_color(reservation.reservation_status.color)
	end
end