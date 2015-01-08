class EntityPropertiesController < CrudController
  before_action :set_menu

  private

  def parent_model
    Entity
  end

  def parent_path
    [@organisation, parent]
  end

  def collection_method
    :properties
  end

  def respond_location
    collection_path
  end

  def permitted_params
    [:property_type_id, :value, :value_id, value_ids: []]
  end

  def set_menu
    @current_menu_category = :entities
    @current_menu_sub_category = @entity.entity_type.id
    @current_menu_link = @entity.id
  end
end
