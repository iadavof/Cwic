class PropertyTypesController < ApplicationController
  before_action :load_resource
  authorize_resource

  # GET /property_types
  def index
    respond_with(@property_types)
  end

  # GET /property_types/1
  def show
    respond_with(@property_type)
  end

  # GET /property_types/new
  def new
    respond_with(@property_type)
  end

  # GET /property_types/1/edit
  def edit
    respond_with(@property_type)
  end

  # POST /property_types
  def create
    @property_type.attributes = resource_params
    @property_type.save
    respond_with(@property_type)
  end

  # PATCH/PUT /property_types/1
  def update
    @property_type.update_attributes(resource_params)
    respond_with(@property_type)
  end

  # DELETE /property_types/1
  def destroy
    @property_type.destroy
    respond_with(@property_type)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @property_types = PropertyType.accessible_by(current_ability, :index)
    when 'new', 'create'
      @property_type = PropertyType.new
    else
      @property_type = PropertyType.find(params[:id])
    end
  end

  # Only allow a trusted parameter "white list" through.
  def resource_params
    params.require(:property_type).permit(:entity_type_id, :name, :description, :data_type_id)
  end

  def interpolation_options
    { resource_name: @property_type.instance_name }
  end
end
