class DocumentsController < CrudController
  before_action :set_menu

  def show
    send_file(@document.document.path, disposition: 'attachment', url_based_filename: false)
  end

  private

  def parent_models
    [OrganisationClient, Entity]
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

  def set_menu
    case parent
    when Entity
      @current_menu_category = :entities
      @current_menu_sub_category = @entity.entity_type.id
      @current_menu_link = @entity.id
    else
      @current_menu_sub_category = parent_model.model_name.route_key.to_sym
      @current_menu_link = :show
    end
  end
end
