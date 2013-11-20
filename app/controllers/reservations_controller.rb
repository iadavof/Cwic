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
    if @reservation.organisation_client.nil?
      @reservation.build_organisation_client
    end
    respond_with(@reservation)
  end

  # GET /reservations/1/edit
  def edit
    respond_with(@reservation)
  end

  # POST /reservations
  def create
    sdflkasdj
    if params[:organisation_client_type].present?
      if params[:organisation_client_type] == 'new'
        @focus = 'new_client'
        params[:reservation].delete(:organisation_client_id)
      else
        @focus = 'existing_client'
        params[:reservation].delete(:organisation_client_attributes)
      end
    end

    @reservation.localized.attributes = resource_params
    @reservation.organisation_client.lat = resource_params[:organisation_client_attributes][:lat] if resource_params[:organisation_client_attributes].present?
    @reservation.organisation_client.lng = resource_params[:organisation_client_attributes][:lng] if resource_params[:organisation_client_attributes].present?

    if params[:full].present?
      @reservation.build_organisation_client
      return render action: :new
    elsif params[:full_new_client]
      @focus = 'new_client'
      @reservation.build_organisation_client
      return render action: :new
    end

    @reservation.save
    respond_with(@organisation, @reservation)
  end

  # PATCH/PUT /reservations/1
  def update
    @reservation.localized.update_attributes(resource_params)
    @reservation.organisation_client.lat = resource_params[:organisation_client_attributes][:lat] if resource_params[:organisation_client_attributes].present?
    @reservation.organisation_client.lng = resource_params[:organisation_client_attributes][:lng] if resource_params[:organisation_client_attributes].present?
    respond_with(@organisation, @reservation)
  end

  # DELETE /reservations/1
  def destroy
    @reservation.destroy
    respond_with(@organisation, Reservation)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      if params[:mini_search].present?
        @reservations = @organisation.reservations.global_search(params[:mini_search]).accessible_by(current_ability, :index).page(params[:page])
        # if no results, check if not a page is selected that does not exist
        unless @reservations.present?
          @reservations = @organisation.reservations.global_search(params[:mini_search]).accessible_by(current_ability, :index).page(1)
        end
      else
        @reservations = @organisation.reservations.accessible_by(current_ability, :index).page(params[:page])
        # if no results, check if not a page is selected that does not exist
        unless @reservations.present?
          @reservations = @organisation.reservations.accessible_by(current_ability, :index).page(1)
        end
      end
    when 'new', 'create'
      @reservation = @organisation.reservations.build
    else
      @reservation = @organisation.reservations.find(params[:id])
    end
  end

  def resource_params
    params.require(:reservation).permit(:description, :begins_at, :ends_at, :begins_at_date, :begins_at_tod, :ends_at_date, :ends_at_tod, :entity_id, :organisation_client_id,
    organisation_client_attributes: [:first_name, :infix, :last_name, :email, :route, :street_number, :locality, :administrative_area_level_2, :administrative_area_level_1, :country, :postal_code, :address_type, :lng, :lat])
  end

  def interpolation_options
    { resource_name: @reservation.instance_name }
  end
end
