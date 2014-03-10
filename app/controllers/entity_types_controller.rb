class EntityTypesController < ApplicationController
  before_action :load_resource
  authorize_resource through: :organisation

  # GET /entity_types
  def index
    respond_with(@entity_types)
  end

  # GET /entity_types/1
  def show
    respond_with(@entity_type)
  end

  # GET /entity_types/new
  def new
    respond_with(@entity_type)
  end

  # GET /entity_types/1/edit
  def edit
    respond_with(@entity_type)
  end

  # POST /entity_types
  def create
    @entity_type.reservation_statuses.clear # Wis de standaard reserveringstatusses omdat deze anders dubbel worden toegevoegd
    @entity_type.localized.attributes = resource_params
    @entity_type.save
    respond_with(@organisation, @entity_type)
  end

  # PATCH/PUT /entity_types/1
  def update
    @entity_type.localized.update_attributes(resource_params)
    respond_with(@organisation, @entity_type)
  end

  # DELETE /entity_types/1
  def destroy
    @entity_type.destroy
    respond_with(@organisation, @entity_type)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @entity_types = @organisation.entity_types.accessible_by(current_ability, :index).ssp(params)
    when 'new', 'create'
      @entity_type = @organisation.entity_types.build
    else
      @entity_type = @organisation.entity_types.find(params[:id])
    end
  end

  def resource_params
    params.require(:entity_type).permit(
      :name, :description, :icon_id,
      properties_attributes: [:id, :name, :description, :data_type_id, :required, :default_value, :index, :_destroy,
        options_attributes: [:id, :name, :default, :index, :_destroy]
      ],
      options_attributes: [:id, :name, :description, :amount_relevant, :default_price, :index, :_destroy],
      entity_images_attributes: [:id, :title, :image, :image_cache, :remote_image_url, :_destroy],
      reservation_statuses_attributes: [:id, :name, :color, :index, :blocking, :info_boards, :billable, :_destroy],
    )
  end

  def interpolation_options
    { resource_name: @entity_type.instance_name }
  end
end
