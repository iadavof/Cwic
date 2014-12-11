class Front::FrontendEntityTypesController < CrudController

  layout 'frontend'

  def gallery

  end

  def list

  end

  private

  def parent_model
    Frontend
  end

end
