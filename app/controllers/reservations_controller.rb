class ReservationsController < ApplicationController
  before_action :load_organisation_client
  before_action :load_resource
  authorize_resource

  respond_to :html, except: :update_status
  respond_to :json
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
      # Set map coordinates on coordinates organisation
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

    if @reservation.save
      ReservationLog.create(reservation: @reservation, user: current_user)
    end

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

  # PATCH/PUT /reservations/1
  def update
    @reservation.localized.update_attributes(resource_params)
    ReservationLog.create(reservation: @reservation, user: current_user)
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

  def multiple_action
    # Check if a parameter key edit or delete is defined, this is the name of the submit button that is clicked
    action = %w(edit delete).detect {|action| params[action] }
    "multiple_#{action}"
  end

  def multiple_edit
    # Handle edit
    attributes = [:description, :begins_at_date, :begins_at_tod, :ends_at_date, :ends_at_tod, :entity_id, :organisation_client_id]
    if params[:process] == 'process'
      @reservation = Reservation.new
      @reservation.localized.update_attributes(resource_params)

      # Remove the validation errors from form_reservation because we dont need this
      @reservation.errors.clear
      valid = params[:edit_fields].present? && alter_multiple_edit_reservations(@reservations, @reservation, attributes)
      if(valid)
        @reservations.map { |r| ReservationLog.create(reservation: r, user: current_user); r.save }
        redirect_to session.delete(:return_to)
       else
        load_resource
        render 'reservations/multiple/edit'
       end
    else
      @reservation = generate_multiple_edit_set_reservation(@reservations, attributes)
      render 'reservations/multiple/edit'
    end
  end

  def multiple_delete
    # Handle delete
    if params[:confirm] == 'confirm'
      @reservations.destroy_all
      redirect_to session.delete(:return_to)
    else
      render 'reservations/multiple/delete'
    end
  end

  def generate_multiple_edit_set_reservation(reservations, attributes)
    set_reservation = Reservation.new
    # Copy values from first reservation
    attributes.each do |a|
      set_reservation.send(a.to_s + '=', reservations.first.send(a))
    end

    reservations.each do |r|
      attributes.each do |a|
        if r.send(a) != set_reservation.send(a)
          # Not the same, so nillify
          set_reservation.send(a.to_s + '=', nil)
          attributes.delete_if {|key, value| value == a }
        end
      end
      # Do not continue,because everything is different already
      return false if attributes.count <= 0
    end
    set_reservation
  end

  def alter_multiple_edit_reservations(reservations, form_reservation, attributes)
    # Setting the new attribute values
    attributes.each do |a|
      new_value = resource_params[a.to_s]
      if params[:edit_fields].include?(a.to_s)
        reservations.map { |r| r.send(a.to_s + '=', new_value) }
      end
    end

    # Checking if the new attribute values are possible
    # Adding errors to the form_reservation
    valid = true
    unless reservations_not_overlapping_each_other(reservations)
      valid = false
      form_reservation.errors.add(:base, I18n.t('activerecord.errors.models.reservation.multiple_edit_overlaps'))
    else
      reservations.each do |res|
        puts res.inspect
        # Disable standard overlapping validation (which possibly includes reservation which are also being edited with this multiple edit action)
        res.validate_overlapping = false
        unless res.valid? && res.not_overlapping_with_set(res.entity.reservations.where.not(id: reservations.ids))
          res.errors.full_messages.each do |ir_message|
            if ir_message
              valid = false
              form_reservation.errors.add(:base, I18n.t('activerecord.errors.models.reservation.multiple_edit_error_html', reservation_id: res.id, ir_message: ir_message).html_safe)
            end
          end
        end
      end
    end
    valid
  end

  def reservations_not_overlapping_each_other(reservations)
    # We are going to alter this set, so dup to make the altering non-permanent
    dupreservations = reservations.dup

    valid = true
    while refres = dupreservations.shift
      dupreservations.each do |res|
        if res.begins_at <= refres.ends_at && res.ends_at >= refres.begins_at
          valid = false
          break
        end
      end
    end
    valid
  end

  def load_resource
    case params[:action]
    when 'index'
      if @organisation_client.present?
        reservations = @organisation_client.reservations
      else
        reservations = @organisation.reservations
      end
      @reservations = reservations.accessible_by(current_ability, :index).by_date_domain(params[:date_domain_from], params[:date_domain_to]).ssp(params)
    when 'multiple'
      @reservations = @organisation.reservations.where(id: params[:reservation_ids])
    when 'new', 'create'
      @reservation = @organisation.reservations.build
    else
      @reservation = @organisation.reservations.find(params[:id])
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
