json.id reservation.id
json.begin_moment reservation.begins_at.strftime('%Y-%m-%d %H:%M')
json.end_moment reservation.ends_at.strftime('%Y-%m-%d %H:%M')
json.bg_color reservation.entity.color
json.text_color reservation.entity.text_color
json.description reservation.instance_name + (reservation.description.present? ? (' : ' + reservation.description) : '') + ', ' + reservation.organisation_client.instance_name
json.client_id reservation.organisation_client.id
json.entity_id reservation.entity.id