json.array! @stickies do |sticky|
  json.partial! 'stickies/sticky', sticky: sticky
end
