json.id sticky.id
json.author do
  json.id sticky.user.id
  json.name sticky.user.instance_name
end
json.sticky_text sticky.sticky_text
json.created_at sticky.created_at.strftime('%Y-%m-%d %H:%M')
