class EntityImagesController < CrudController
  before_action :set_menu

  private

  def parent_models
    [Entity, EntityType]
  end

  def parent_path
    [@organisation, parent]
  end

  def collection_method
    :images
  end

  def respond_location
    collection_path
  end

  def permitted_params
    [:title, :image, :image_cache, :remote_image_url]
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
