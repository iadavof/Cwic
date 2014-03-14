class InfoScreensController < ApplicationController
  before_action :load_resource
  authorize_resource

  respond_to :html, :json

  # GET /info_screens
  def index
    respond_with(@info_screens)
  end

  # GET /info_screens/1
  def show
    respond_with(@info_screen)
  end

  # GET /info_screens/1/reservations.json
  def info_screen_reservations
    @reservations = []
    @active_ises = @info_screen.info_screen_entities.where("#{InfoScreenEntityType.table_name}.active = true").active.includes(:entity)
    @active_ises.each do |ise|
      @reservations += ise.entity.reservations.by_date_domain(Time.now, Time.now + 1.day).info_boards.includes(:entity)
    end
    @reservations.sort_by(&:begins_at)
    respond_with(@info_screen, @active_ises, @reservations)
  end

  # GET /info_screens/new
  def new
    @info_screen.initialize_entity_types_and_entities
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
    redirect_to action: "index"
  end

  # PATCH/PUT /info_screens/1
  def update
    @info_screen.update_attributes(resource_params)
    redirect_to action: "index"
  end

  # DELETE /info_screens/1
  def destroy
    @info_screen.destroy
    redirect_to action: "index"
  end

private

  def load_resource
    case params[:action]
    when 'index'
      @info_screens = @organisation.info_screens.accessible_by(current_ability, :index).includes(info_screen_entities: :entity).ssp(params)
    when 'new', 'create'
      @info_screen = @organisation.info_screens.build
    else
      @info_screen = @organisation.info_screens.find(params[:id])
    end
  end

  def resource_params
    params.require(:info_screen).permit(
      :name, :public, :show_reservation_number, :add_new_entity_types, :direction_char_visible, :clock_header,
        info_screen_entity_types_attributes: [:id, :entity_type_id, :add_new_entities, :active,
          info_screen_entities_attributes: [:id, :entity_id, :direction_char, :active],
        ],
      )
  end

  def interpolation_options
    { resource_name: @info_screen.instance_name }
  end
end
