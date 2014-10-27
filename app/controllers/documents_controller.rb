class DocumentsController < CrudController
  before_action :update_menu

  def show
    send_file(@document.document.path, disposition: 'attachment', url_based_filename: false)
  end

  private

  def parent_models
    [OrganisationClient]
  end

  def parent_path
    [@organisation, parent]
  end

  def respond_location
    collection_path
  end

  def permitted_params
    [:document, :document_cache, :remote_document_url]
  end

  def update_menu
    @current_menu_sub_category = parent_model.model_name.route_key.to_sym
    @current_menu_link = :show
  end
end
