class Front::FrontendEntityTypesController < CrudController

  include FrontMatter

  def gallery

  end

  def list

  end

  private

  def parent_model
    Frontend
  end

end
