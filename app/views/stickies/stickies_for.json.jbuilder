json.array! @stickies do |sticky|
  json.partial! 'sticky', sticky: sticky
end
