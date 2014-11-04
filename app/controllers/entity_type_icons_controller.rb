class EntityTypeIconsController < CrudController
  before_action :set_organisation_scope_menu, if: -> { @organisation.present? }

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

  def set_organisation_scope_menu
    @current_menu_sub_category = :entity_types
    @current_menu_link = :custom_icons
  end
end
