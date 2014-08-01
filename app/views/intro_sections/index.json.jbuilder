json.array!(@intro_sections) do |intro_section|
  json.extract! intro_section, :id, :title, :body, :image, :weight, :background-color
  json.url intro_section_url(intro_section, format: :json)
end
