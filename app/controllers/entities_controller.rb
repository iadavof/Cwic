class EntitiesController < ApplicationController
  before_action :load_resource
  authorize_resource through: :organisation

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
    @entity.localized.attributes = resource_params
    @entity.save
    respond_with(@organisation, @entity)
  end

  # PATCH/PUT /entities/1
  def update
    return if check_entity_type_changed('edit')
    @entity.localized.update_attributes(resource_params)
    respond_with(@organisation, @entity)
  end

  # DELETE /entities/1
  def destroy
    @entity.destroy
    respond_with(@organisation, @entity)
  end

private
  def load_resource
    case params[:action]
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
      :name, :frontend_name, :color, :description, :entity_type_id, :organisation_id, :include_entity_type_images, :slack_before, :slack_after,
      properties_attributes: [:id, :property_type_id, :value, :value_id, value_ids: []],
      entity_images_attributes: [:id, :title, :image, :image_cache, :remote_image_url, :_destroy]
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
