json.results @organisation_clients do |organisation_client|
  json.id organisation_client.id
  json.text organisation_client.instance_name
end

json.more !@organisation_clients.last_page?