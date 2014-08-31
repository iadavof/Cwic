class EntitiesController < ApplicationController
  before_action :load_resource
  authorize_resource through: :organisation

  respond_to :html, except: [:availability]
  respond_to :json, only: [:availability]

  # GET /entities
  def index
    respond_with(@entities)
  end

  # GET /entities/1
  def show
    respond_with(@entity)
  end

  # GET /entities/new
  def new
    respond_with(@entity)
  end

  # GET /entities/1/edit
  def edit
    respond_with(@entity)
  end

  # POST /entities
  def create
    return if check_entity_type_changed('new')
    @entity.attributes = resource_params
    @entity.save
    respond_with(@organisation, @entity)
  end

  # PATCH/PUT /entities/1
  def update
    return if check_entity_type_changed('edit')
    @entity.update_attributes(resource_params)
    respond_with(@organisation, @entity)
  end

  # DELETE /entities/1
  def destroy
    @entity.destroy
    respond_with(@organisation, @entity)
  end

  def availability
    # PERFORMANCE: in this action (and espacially in its view) many queries are performed to check for overlap, get max slack values, etcetera.
    # Since this action is often called by the Reservation form JavaScript, it might be desired to optimize its performance.
    @begins_at = Time.parse(params[:begins_at])
    @ends_at = Time.parse(params[:ends_at])
    @selected_entity = @organisation.entities.find(params[:selected_entity_id]) if params[:selected_entity_id].present?
    if @selected_entity.present?
      @selected_entity_reservation = (params[:reservation_id].present? ? Reservation.find(params[:reservation_id]) : Reservation.new)
      @selected_entity_reservation.assign_attributes(entity: @selected_entity, begins_at: @begins_at, ends_at: @ends_at)
      @selected_entity_reservation.valid? # Set the errors
    end
    respond_with(@organisation, @entities, @selected_entity)
  end

private
  def load_resource
    case params[:action]
    when 'availability'
      # All entities for this Entity type
      @entities = @organisation.entity_types.find(params[:entity_type_id]).entities.accessible_by(current_ability, :index)
      # Get the available entities for the time period
      @entities = @entities.available_between(Time.parse(params[:begins_at]), Time.parse(params[:ends_at]), ignore_reservations: params[:reservation_id])
    when 'index'
      @entities = @organisation.entities.accessible_by(current_ability, :index).includes(:entity_type).ssp(params)
    when 'new', 'create'
      @entity = @organisation.entities.build
    else
      @entity = @organisation.entities.find(params[:id])
    end
  end

  def resource_params
    params.require(:entity).permit(
      :tag_list, :name, :frontend_name, :color, :description, :entity_type_id, :organisation_id, :include_entity_type_images, :slack_before, :slack_after,
      properties_attributes: [:id, :property_type_id, :value, :value_id, value_ids: []],
      images_attributes: [:id, :title, :image, :image_cache, :remote_image_url, :_destroy],
      documents_attributes: [:id, :document, :document_cache, :remote_document_url, :_destroy]
    )
  end

  def interpolation_options
    { resource_name: @entity.instance_name }
  end

  def check_entity_type_changed(template)
    return false unless params[:entity_type_changed].present?
    @entity.entity_type_id = resource_params[:entity_type_id]
    @entity.rebuild_properties
    render template
    true
  end
end
