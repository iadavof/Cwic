class InfoScreensController < ApplicationController
  before_action :load_resource
  authorize_resource

  # GET /info_screens
  def index
    respond_with(@info_screens)
  end

  # GET /info_screens/1
  def show
    respond_with(@info_screen)
  end

  # GET /info_screens/new
  def new
    @info_screen.info_screen_entity_types << @organisation.entity_types.map { |et| InfoScreenEntityType.new(entity_type: et) }
    @info_screen.info_screen_entity_types.each do |iset|
      iset.info_screen_entities << @organisation.entities.map { |e| InfoScreenEntity.new(entity: e) }
    end
    respond_with(@info_screen)
  end

  # GET /info_screens/1/edit
  def edit
    respond_with(@info_screen)
  end

  # POST /info_screens
  def create
    @info_screen.attributes = resource_params
    @info_screen.save
    respond_with(@organisation, @info_screen)
  end

  # PATCH/PUT /info_screens/1
  def update
    @info_screen.update_attributes(resource_params)
    respond_with(@organisation, @info_screen)
  end

  # DELETE /info_screens/1
  def destroy
    @info_screen.destroy
    respond_with(@organisation, @info_screen)
  end

private

  def load_resource
    case params[:action]
    when 'index'
      @info_screens = @organisation.info_screens.accessible_by(current_ability, :index)
    when 'new', 'create'
      @info_screen = @organisation.info_screens.build
    else
      @info_screen = @organisation.info_screens.find(params[:id])
    end
  end

  def resource_params
    params.require(:info_screen).permit(
      :name, :public, :add_new_entity_types,
        info_screen_entity_type_attributes: [:add_new_entities, :active,
          info_screen_entity_attributes: [:direction_char, :active],
        ],
      )
  end

  def interpolation_options
    { resource_name: @info_screen.instance_name }
  end
end
