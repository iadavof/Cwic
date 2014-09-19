class EntityTypeIconsController < CrudController
  before_action :update_menu

private
  def parent_models
    # Parent is organisation or nil (no parent, used in admin interface)
    [Organisation, nil]
  end

  def collection_includes
    :organisation unless @organisation.present?
  end

  def permitted_params
    [:name, :image, :image_cache, :remote_image_url, :remove_image, (:organisation_id unless @organisation.present?)]
  end

  def update_menu
    if @organisation.present?
      @current_menu_category = :settings
      @current_menu_sub_category = :entity_types
      @current_menu_link = :custom_icons
    end
  end
end
