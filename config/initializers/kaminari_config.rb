Kaminari.configure do |config|
  # config.default_per_page = 25
  # config.max_per_page = 1000 # TODO dit instellen op een goede waarde om DoS aanvallen te voorkomen. Denk er wel aan dat dit ook geldt voor exports, dus we moeten deze knoppen verbergen als het aantal resultaten groter is dan deze waarde.
  # config.window = 4
  # config.outer_window = 0
  # config.left = 0
  # config.right = 0
  # config.page_method_name = :page
  # config.param_name = :page
end
