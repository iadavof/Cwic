class ReservationsController < ApplicationController
  before_action :load_resource
  authorize_resource

  respond_to :html, :json

  # GET /reservations
  def index
    respond_with(@reservations)
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
    @reservation.localized.attributes = resource_params
    @reservation.save
    respond_with(@reservation, location: organisation_reservation_path(@organisation, @reservation))
  end

  # PATCH/PUT /reservations/1
  def update
    @reservation.localized.update_attributes(resource_params)
    respond_with(@reservation, location: organisation_reservation_path(@organisation, @reservation))
  end

  # DELETE /reservations/1
  def destroy
    @reservation.destroy
    respond_with(@reservation, location: organisation_reservations_path(@organisation))
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
    params.require(:reservation).permit(:begins_at, :ends_at, :begins_at_date, :begins_at_tod, :ends_at_date, :ends_at_tod, :entity_id, :organisation_client_id)
  end

  def interpolation_options
    { resource_name: @reservation.instance_name }
  end
end
