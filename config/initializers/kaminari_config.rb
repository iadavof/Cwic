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

# Force Kaminari to include page param also for the first page
# TODO: remove this patch after there is a proper solution for Kaminari Issue 44 (https://github.com/amatsuda/kaminari/issues/44)
class Kaminari::Helpers::Tag
  def page_url_for(page)
    @template.url_for @params.merge(@param_name => (page < 1 ? nil : page), only_path: true)
  end
end
