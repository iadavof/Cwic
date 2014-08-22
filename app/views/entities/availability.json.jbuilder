json.entities @entities.each do |e|
  json.id e.id
  json.name e.instance_name
  json.color e.color
  json.available true
  json.default_slack_before e.get_slack_before
  json.default_slack_after e.get_slack_after
  json.max_slack_before e.get_max_slack_before(@begins_at)
  json.max_slack_after e.get_max_slack_after(@ends_at)
end

if @selected_entity.present?
  json.selected_entity do
    json.available @selected_entity.is_available_between?(@begins_at, @ends_at, ignore_reservations: params[:ignore_reservation_ids])
    json.default_slack_before @selected_entity.get_slack_before
    json.default_slack_after @selected_entity.get_slack_after
    json.max_slack_before @selected_entity.get_max_slack_before(@begins_at)
    json.max_slack_after @selected_entity.get_max_slack_after(@ends_at)
  end
end
