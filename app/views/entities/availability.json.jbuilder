json.entities @entities.each do |e|
  json.id e.id
  json.name e.instance_name
  json.color e.color
  json.default_slack_before e.get_slack_before
  json.default_slack_after e.get_slack_after
  json.warning true
end
if @selected_entity_feedback.present?
  json.selected_entity do
    json.available @selected_entity_feedback[:available]
    json.warning false
  end
end
