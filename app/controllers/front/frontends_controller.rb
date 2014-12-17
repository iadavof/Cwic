class Front::FrontendsController < CrudController

  include FrontMatter

  private

  def find_member
    model.find(params[:frontend_id])
  end

end
