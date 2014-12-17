class Front::EntitiesController < CrudController

  include FrontMatter

  private

  def parent_model
    Frontend
  end

end
