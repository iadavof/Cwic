class Front::EntitiesController < CrudController

  layout 'frontend'

  private

  def parent_model
    Frontend
  end

end
