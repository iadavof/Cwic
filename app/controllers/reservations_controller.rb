class ReservationsController < ApplicationController
  before_action :load_organisation_client
  before_action :load_resource
  before_action :load_recurrences, only: [:show]
  authorize_resource

  respond_to :html, :json

  # GET /reservations
  def index
    respond_with(@organisation, @reservations)
  end

  # GET /reservations/1
  def show
    respond_with(@organisation, @reservation)
  end

  # GET /reservations/new
  def new
    if @reservation.organisation_client.nil?
      @reservation.build_organisation_client
      # set map coordinates on coordinates organisation
      @reservation.organisation_client.lat = @organisation.lat
      @reservation.organisation_client.lng = @organisation.lng
    end

    @reservation.reservation_recurrence_definition = ReservationRecurrenceDefinition.new
    respond_with(@organisation, @reservation)
  end

  # GET /reservations/1/edit
  def edit
    respond_with(@organisation, @reservation)
  end

  # POST /reservations
  def create
    # The tableless record is not persistent so we need to create it again
    @reservation.reservation_recurrence_definition = ReservationRecurrenceDefinition.new(reservation: @reservation)
    
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

  # PATCH/PUT /reservations/1/update_status
  def update_status
    @reservation.reservation_status = @reservation.entity.entity_type.reservation_statuses.find(params[:status_id].to_i)
    if @reservation.reservation_status.present? && @reservation.save
      render json: { }, status: :ok
    else
      render json: { error: 'no reservation status found' }, status: :not_found
    end
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
      if @organisation_client.present?
        reservations = @organisation_client.reservations
      else
        reservations = @organisation.reservations
      end
      reservations = apply_date_domain(reservations)
      reservations = apply_search_query(reservations)

      @reservations = reservations.accessible_by(current_ability, :index).order(id: :desc).page(params[:page])
      # if no results, check if not a page is selected that does not exist
      unless @reservations.present?
        @reservations = reservations.accessible_by(current_ability, :index).order(id: :desc).page(1)
      end
    when 'new', 'create'
      @reservation = @organisation.reservations.build
    else
      @reservation = @organisation.reservations.find(params[:id])
    end
  end

  def apply_search_query(reservations)
    if params[:mini_search].present?
      reservations.global_search(params[:mini_search])
    else
      reservations
    end
  end

  def load_recurrences
    @recurrences = @reservation.get_recurrences
  end

  def apply_date_domain(reservations)
    if params[:date_domain_from].present? && params[:date_domain_to].present?
      reservations.where('begins_at <= :end AND ends_at >= :begin', begin: Date.strptime(params[:date_domain_from], I18n.t('date.formats.default')).beginning_of_day, end: Date.strptime(params[:date_domain_to], I18n.translate('date.formats.default')).end_of_day)
    elsif params[:date_domain_from].present?
      reservations.where('ends_at >= :begin', begin: Date.strptime(params[:date_domain_from], I18n.t('date.formats.default')).beginning_of_day)
    elsif params[:date_domain_to].present?
      reservations.where('begins_at <= :end', end: Date.strptime(params[:date_domain_to], I18n.t('date.formats.default')).end_of_day)
    else
      reservations
    end
  end

  def load_organisation_client
    if params[:organisation_client_id].present?
      @organisation_client = @organisation.organisation_clients.find(params[:organisation_client_id])
    end
  end

  def resource_params
    params.require(:reservation).permit(:description, :begins_at, :ends_at, :begins_at_date, :begins_at_tod, :ends_at_date, :ends_at_tod, :entity_id, :organisation_client_id,
    organisation_client_attributes: [:first_name, :infix, :last_name, :email, :phone, :mobile_phone, :route, :street_number, :locality, :administrative_area_level_2, :administrative_area_level_1, :country, :postal_code, :address_type, :lng, :lat],
    reservation_recurrence_definition_attributes: [:repeating, :repeating_unit_id, :repeating_every, { :repeating_weekdays => [] }, { :repeating_monthdays => [] }, :repeating_end, :repeating_until, :repeating_instances])
  end

  def interpolation_options
    { resource_name: @reservation.instance_name }
  end
end
