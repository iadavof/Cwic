class ReservationsController < ApplicationController
  before_action :load_resource
  authorize_resource

  # GET /reservations
  def index
    respond_with(@reservations)
  end

  def index_domain
    if params[:entity_ids].present?
      entity_ids = params[:entity_ids].split(',')
      if params[:schedule_begin].present? && params[:schedule_end].present?
        start_date = Date.strptime(params[:schedule_begin], "%Y-%m-%d")
        end_date = Date.strptime(params[:schedule_end], "%Y-%m-%d") + 1.day
      else
        start_date = Date.today
        end_date = (Date.today + 2.weeks)
      end
      result = []
      entity_ids.each do |eid|
        current_reservations = @organisation.reservations.where(entity_id: eid).where('ends_at BETWEEN :start AND :end OR begins_at BETWEEN :start AND :end', start: start_date, end: end_date)
        items = []
        current_reservations.each do |r|
         items << {item_id: r.id, begin_date: r.begins_at.strftime('%Y-%m-%d'), begin_time: r.begins_at.strftime('%H:%i'), end_date: r.ends_at.strftime('%Y-%m-%d'), end_time: r.ends_at.strftime('%H:%i'), color: '#FF0000', description: 'Beschrijving TODO'}
        end
        result << {schedule_object_id: eid, items: items }
      end
      render json: {begin_date: start_date.strftime('%Y-%m-%d'), end_date: end_date.strftime('%Y-%m-%d'), schedule_objects: result}, status: :ok
    else
      render json: {error: 'no entity selected'}, status: :not_found
    end
  end

  # GET /reservations/1
  def show
    respond_with(@reservation)
  end

  # GET /reservations/new
  def new
    respond_with(@reservation)
  end

  # GET /reservations/1/edit
  def edit
    respond_with(@reservation)
  end

  # POST /reservations
  def create
    @reservation.attributes = resource_params
    @reservation.save
    respond_with(@reservation)
  end

  # PATCH/PUT /reservations/1
  def update
    @reservation.update_attributes(resource_params)
    respond_with(@reservation)
  end

  # DELETE /reservations/1
  def destroy
    @reservation.destroy
    respond_with(@reservation)
  end

private
  def load_resource
    case params[:action]
    when 'index', 'index_domain'
      @reservations = @organisation.reservations.accessible_by(current_ability, :index)
    when 'new', 'create'
      @reservation = @organisation.reservations.build
    else
      @reservation = @organisation.reservations.find(params[:id])
    end
  end

  def resource_params
    params.require(:reservation).permit(:begins_at_date, :begins_at_time, :ends_at_date, :ends_at_time, :entity, :organisation_client_id)
  end

  def interpolation_options
    { resource_name: @reservation.instance_name }
  end
end
