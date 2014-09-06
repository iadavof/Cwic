json.entities @entities.each do |e|
  json.id e.id
  json.name e.instance_name
  json.icon e.entity_type.icon.image.icon.url
  json.color e.color
end
