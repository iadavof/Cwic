class EntitiesController < CrudController
  skip_before_action :load_member, only: :available
  before_action :load_entity_type, only: :available

  respond_to :html, except: [:available]
  respond_to :json, only: [:index, :available]

  def create
    return if check_entity_type_changed('new')
    super
  end

  def update
    return if check_entity_type_changed('edit')
    super
  end

  def available
    # PERFORMANCE: in this action (and espacially in its view) many queries are performed to check for overlap, get max slack values, etcetera.
    # Since this action is often called by the Reservation form JavaScript, it might be desired to optimize its performance.
    # IMPROVEMENT: maybe move this action to the EntityTypesController?
    @begins_at = Time.parse(params[:begins_at])
    @ends_at = Time.parse(params[:ends_at])
    @entities = @entity_type.entities
      .accessible_by(current_ability, :index)
      .available_between(@begins_at, @ends_at, ignore_reservations: params[:reservation_id])

    @selected_entity = @organisation.entities.find(params[:selected_entity_id]) if params[:selected_entity_id].present?
    if @selected_entity.present?
      @selected_entity_reservation = (params[:reservation_id].present? ? Reservation.find(params[:reservation_id]) : Reservation.new)
      @selected_entity_reservation.assign_attributes(entity: @selected_entity, begins_at: @begins_at, ends_at: @ends_at)
      @selected_entity_reservation.valid? # Set the errors
    end

    respond_with(@organisation, @entities, @selected_entity)
  end

private
  def parent_model
    Organisation
  end

  def collection_includes
    :entity_type
  end

  def permitted_params
    [
      :tag_list, :name, :frontend_name, :color, :description, :entity_type_id, :organisation_id, :include_entity_type_images, :slack_before, :slack_after,
      properties_attributes: [:id, :property_type_id, :value, :value_id, value_ids: []],
      images_attributes: [:id, :title, :image, :image_cache, :remote_image_url, :_destroy],
      documents_attributes: [:id, :document, :document_cache, :remote_document_url, :_destroy]
    ]
  end

  def load_entity_type
    @entity_type = @organisation.entity_types.find(params[:entity_type_id])
  end

  def check_entity_type_changed(template)
    return false unless params[:entity_type_changed].present?
    @entity.entity_type_id = member_params[:entity_type_id]
    @entity.rebuild_properties
    render template
    true
  end
end
