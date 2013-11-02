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
    result = {}
    active_ises = @info_screen.info_screen_entity_types.active.info_screen_entities.active
    active_ises.each do |ise|
      entity_result = {}

      entity_result.entity_id = ise.entity.id
      entity_result.entity_name = ise.entity.instance_name

      current_reservations << ise.entities.reservations.where('begins_at <= :update_scope_stop AND ends_at >= :update_scope_start', update_scope_start: Time.now, update_scope_stop: Time.now + 30.minutes).order(:begins_at)
      
      current_reservations.each do |r|
        entity_result.reservations << {
          id: r.id,
          color: r.entity.color,
          begin_moment: r.begins_at.strftime('%Y-%m-%d %H:%M'),
          end_moment: r.ends_at.strftime('%Y-%m-%d %H:%M'),
          description: r.organisation_client.instance_name,
        }
      end

      if ise.direction_char.present?
        entity_result.direction_char = ise.direction_char
      end
      result << entity_result
    end

    result.sort

    render json: { entities: result }, status: :ok
  end

  # GET /info_screens/new
  def new
    @info_screen.info_screen_entity_types << @organisation.entity_types.map { |et| InfoScreenEntityType.new(entity_type: et, info_screen: @info_screen) }
    @info_screen.info_screen_entity_types.each do |iset|
      iset.info_screen_entities << @organisation.entities.where('entity_type_id = ?', iset.entity_type.id).map { |e| InfoScreenEntity.new(entity: e, info_screen_entity_type: iset) }
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
        info_screen_entity_types_attributes: [:id, :add_new_entities, :active,
          info_screen_entities_attributes: [:id, :direction_char, :active],
        ],
      )
  end

  def interpolation_options
    { resource_name: @info_screen.instance_name }
  end
end
