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
    result = []

    active_ises = @info_screen.info_screen_entities.where("#{InfoScreenEntityType.table_name}.active = true").active

    active_ises.each do |ise|

      current_reservations = ise.entity.reservations.where('begins_at <= :update_scope_stop AND ends_at >= :update_scope_start', update_scope_start: Time.now, update_scope_stop: Time.now + 1.day)

      current_reservations.each do |r|
        result << {
          entity_id: r.entity.id,
          entity_name: r.entity.instance_name,
          id: r.id,
          color: r.entity.color,
          begin_moment: r.begins_at.strftime('%Y-%m-%d %H:%M'),
          begin_unix: r.begins_at.to_i,
          end_unix: r.ends_at.to_i,
          end_moment: r.ends_at.strftime('%Y-%m-%d %H:%M'),
          description: r.organisation_client.instance_name,
          direction_char: ise.direction_char,
        }
      end
    end
    result.sort {|a, b| a[:begin_unix] <=> b[:begin_unix]}

    render json: { reservations: result, settings: info_screen_settings}, status: :ok
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
      @info_screens = @organisation.info_screens.accessible_by(current_ability, :index)
    when 'new', 'create'
      @info_screen = @organisation.info_screens.build
    else
      @info_screen = @organisation.info_screens.find(params[:id])
    end
  end

  def resource_params
    params.require(:info_screen).permit(
      :name, :public, :add_new_entity_types, :direction_char_visible, :clock_header,
        info_screen_entity_types_attributes: [:id, :entity_type_id, :add_new_entities, :active,
          info_screen_entities_attributes: [:id, :entity_id, :direction_char, :active],
        ],
      )
  end

  def interpolation_options
    { resource_name: @info_screen.instance_name }
  end

  def info_screen_settings
    {
      direction_char_visible: @info_screen.direction_char_visible,
      clock_header: @info_screen.clock_header,
    }
  end
end
