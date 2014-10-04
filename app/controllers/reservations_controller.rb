class ReservationsController < ApplicationController
  # TODO: rewrite to CrudController
  MULTIPLE_EDIT_ATTRIBUTES = [:description, :begins_at_date, :begins_at_tod, :ends_at_date, :ends_at_tod, :entity_id, :organisation_client_id]

  before_action :load_organisation_client
  before_action :set_first_page, only: :index
  before_action :load_resource
  authorize_resource

  respond_to :html, except: :update_status
  respond_to :json, only: [:create, :update, :destroy]
  respond_to :csv, :xls, only: :index

  # GET /reservations
  def index
    respond_with do |format|
      format.csv { send_data(@reservations.export(:csv), filename: Reservation.export_filename(:csv)) }
      format.xls { send_data(@reservations.export(:xls), filename: Reservation.export_filename(:xls)) }
    end
  end

  # GET /reservations/1
  def show
    respond_with(@organisation, @reservation)
  end

  # GET /reservations/new
  def new
    if @reservation.organisation_client.nil?
      @reservation.build_organisation_client
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

    if params[:full].present?
      @reservation.build_organisation_client
      return render action: :new
    elsif params[:full_new_client]
      @reservation.build_organisation_client
      @focus = 'new_client'
      return render action: :new
    end

    @reservation.save
    @reservation.build_organisation_client if @reservation.organisation_client.blank? # Rebuild the blank organisation client if needed
    respond_with(@organisation, @reservation)
  end

  # PATCH/PUT /reservations/1
  def update
    @reservation.localized.update_attributes(resource_params)
    respond_with(@organisation, @reservation)
  end

  # PATCH/PUT /reservations/1/multiple
  def multiple
    session[:return_to] ||= request.referer
    @return_url = session[:return_to]
      # Check if nothing is selected
    if @reservations.empty?
      redirect_to session.delete(:return_to)
      return
    end
    send multiple_action
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

  def multiple_action
    # Check if a parameter key edit or delete is defined, this is the name of the submit button that is clicked
    action = %w(edit delete).detect { |a| params[a] }
    "multiple_#{action}"
  end

  def multiple_edit
    # Handle edit
    if params[:process] == 'process'
      @reservation = Reservation.new
      @reservation.localized.attributes = resource_params
      @reservation.errors.clear # Remove the validation errors from form reservation because we dont need this

      valid = params[:edit_fields].present? && update_multiple_edit_reservations(@reservations, @reservation)
      if valid
        @reservations.map(&:save)
        redirect_to session.delete(:return_to)
      else
        load_resource
        render 'reservations/multiple/edit'
      end
    else
      @reservation = generate_multiple_edit_reservation(@reservations)
      render 'reservations/multiple/edit'
    end
  end

  def multiple_delete
    # Handle delete
    if params[:confirm] == 'confirm'
      amount = @reservations.size
      @reservations.destroy_all
      return_to = session.delete(:return_to)
      return_to = organisation_reservations_path(@organisation) if (route = Rails.application.routes.recognize_path(return_to)) && route[:controller] == 'reservations' && route[:action] == 'show' && !Reservation.exists?(route[:id])
      redirect_to return_to, notice: I18n.t('flash.actions.destroy.notice', resource_name: Reservation.model_name.human(count: amount))
    else
      render 'reservations/multiple/delete'
    end
  end

  def generate_multiple_edit_reservation(reservations)
    reservation = Reservation.new
    # Copy values from first reservation
    MULTIPLE_EDIT_ATTRIBUTES.each do |a|
      reservation.send("#{a}=", reservations.first.send(a))
    end

    reservations.each do |r|
      MULTIPLE_EDIT_ATTRIBUTES.each do |a|
        # Nillify fields if not equal
        reservation.send("#{a}=", nil) unless r.send(a) == reservation.send(a)
      end
    end
    reservation
  end

  def update_multiple_edit_reservations(reservations, reservation)
    # Setting the new values
    MULTIPLE_EDIT_ATTRIBUTES.each do |a|
      new_value = resource_params[a]
      if params[:edit_fields].include?(a.to_s)
        reservations.map { |r| r.send("#{a}=", new_value) }
      end
    end

    # Validate all reservations and copy potential errors to the form reservation
    reservations.each do |res|
      # Disable standard conflicting validation (which possibly includes reservation which are also being edited with this multiple edit action)
      res.validate_not_conflicting = false
      # Check if the reservation is valid and not conflicting with other reservations (that are not included in the current multiple edit set)
      unless res.valid? && res.not_conflicting_with_reservations(res.entity.reservations.blocking.where.not(id: reservations.ids))
        res.errors.full_messages.each do |ir_message|
          if ir_message
            reservation.errors.add(:base, I18n.t('activerecord.errors.models.reservation.multiple_edit_error_html', reservation_id: res.id, ir_message: ir_message).html_safe)
          end
        end
      end
    end

    # Check if the reservations are not conflicting with each other.
    # This should be done after individually validating the reservations, because the before_validation callbacks need to be called first (due to DatetimeSplittable).
    if reservations_conflict_with_each_other?(reservations)
      reservation.errors.add(:base, I18n.t('activerecord.errors.models.reservation.multiple_edit_overlaps'))
    end

    reservation.errors.empty? # Return true if valid
  end

  def reservations_conflict_with_each_other?(reservations)
    # We are going to alter this set, so dup the array to make the altering non-permanent.
    # We dup the array instead of the collection to keep the current attribute values (instead of reloading them).
    dupreservations = reservations.to_a.dup

    while refres = dupreservations.shift
      dupreservations.each do |res|
        return true if refres.conflicts_with_reservation?(res)
      end
    end
    false
  end

  def load_organisation_client
    if params[:organisation_client_id].present?
      @organisation_client = @organisation.organisation_clients.find(params[:organisation_client_id])
    end
  end

  def set_first_page
    # If we render the index view without any configuration for the results table set (except for the limit value),
    if params.slice(:date_domain_from, :date_domain_to, :mini_search, :sort, :direction, :page).blank?
      # Then jump to the page with the first upcoming reservation on it.
      past = reservations.past.ssp(params)
      # We have the amount of reservations in the past,
      # we add one to this (because we want to be on the page with the first upcoming, i.e. non-past, reservation),
      # we divide this by the amount of results per page and round this up to get the correct page
      page = ((past.total_count + 1) / past.limit_value.to_f).ceil
      params[:page] = page
    end
  end

  def load_resource
    case params[:action]
    when 'index'
      @reservations = reservations
        .by_date_domain(params[:date_domain_from], params[:date_domain_to], delocalize: true)
        .includes(:reservation_status, :organisation_client, :entity)
        .ssp(params)
    when 'multiple'
      @reservations = @organisation.reservations.where(id: params[:reservation_ids])
    when 'new', 'create'
      @reservation = @organisation.reservations.build
    else
      @reservation = @organisation.reservations.find(params[:id])
    end
  end

  def reservations
    (@organisation_client.present? ? @organisation_client.reservations : @organisation.reservations)
      .accessible_by(current_ability, :index)
  end

  def resource_params
    params.require(:reservation).permit(:tag_list, :description, :begins_at, :ends_at, :begins_at_date, :begins_at_tod, :ends_at_date, :ends_at_tod, :entity_id, :organisation_client_id, :slack_before, :slack_after,
    organisation_client_attributes: [:first_name, :infix, :last_name, :email, :phone, :mobile_phone, :route, :street_number, :locality, :administrative_area_level_2, :administrative_area_level_1, :country, :postal_code],
    reservation_recurrence_definition_attributes: [:repeating, :repeating_unit_id, :repeating_every, { repeating_weekdays: [] }, { repeating_monthdays: [] }, :repeating_end, :repeating_until, :repeating_instances],
    documents_attributes: [:id, :document, :document_cache, :remote_document_url, :_destroy])
  end

  def interpolation_options
    { resource_name: @reservation.instance_name }
  end
end
