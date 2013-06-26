class EntitiesController < ApplicationController
  before_action :load_resource
  authorize_resource


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
    return if check_entity_type_changed('new')
    @entity.update_attributes(resource_params)
    puts @entity.errors.inspect
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
      @entities = @organisation.entities.accessible_by(current_ability, :index)
    when 'new', 'create'
      @entity = @organisation.entities.build
    else
      @entity = @organisation.entities.find(params[:id])
    end
  end

  def resource_params
    params.require(:entity).permit(:name, :description, :entity_type_id, :organisation_id, properties_attributes: [:id, :property_type_id, :value])
  end

  def interpolation_options
    { resource_name: @entity.instance_name }
  end

  def check_entity_type_changed(template)
    return false unless params[:entity_type_changed].present?
    @entity.entity_type_id = resource_params[:entity_type_id]
    build_properties if @entity.entity_type.present?
    render template
    true
  end

  def build_properties
    @entity.properties.clear
    @entity.properties.build(@entity.entity_type.property_types.map { |pt| { property_type: pt, value: pt.default_value } })
  end
end
