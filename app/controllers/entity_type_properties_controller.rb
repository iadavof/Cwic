class EntityTypePropertiesController < ApplicationController
  before_action :load_resource
  authorize_resource

  # GET /entity_type_properties
  def index
    respond_with(@entity_type_properties)
  end

  # GET /entity_type_properties/1
  def show
    respond_with(@entity_type_property)
  end

  # GET /entity_type_properties/new
  def new
    respond_with(@entity_type_property)
  end

  # GET /entity_type_properties/1/edit
  def edit
    respond_with(@entity_type_property)
  end

  # POST /entity_type_properties
  def create
    @entity_type_property.attributes = resource_params
    @entity_type_property.save
    respond_with(@entity_type_property)
  end

  # PATCH/PUT /entity_type_properties/1
  def update
    @entity_type_property.update_attributes(resource_params)
    respond_with(@entity_type_property)
  end

  # DELETE /entity_type_properties/1
  def destroy
    @entity_type_property.destroy
    respond_with(@entity_type_property)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @entity_type_properties = EntityTypeProperty.accessible_by(current_ability, :index)
    when 'new', 'create'
      @entity_type_property = EntityTypeProperty.new
    else
      @entity_type_property = EntityTypeProperty.find(params[:id])
    end
  end

  # Only allow a trusted parameter "white list" through.
  def resource_params
    params.require(:entity_type_property).permit(:entity_type_id, :name, :description, :data_type_id)
  end

  def interpolation_options
    { resource_name: @entity_type_property.instance_name }
  end
end
