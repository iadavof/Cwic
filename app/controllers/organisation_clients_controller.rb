class OrganisationClientsController < ApplicationController
  before_action :load_resource
  authorize_resource

  respond_to :html, except: :autocomplete
  respond_to :json, only: :autocomplete

  # GET /organisation_clients
  def index
    respond_with(@organisation_clients)
  end

  def autocomplete
    # PERFORMANCE: Kaminari performs two queries: one for total number of results and one to get results in scope.
    # This means the search is performed twice, making it unnecessary slow.
    # PostgreSQL has a feature to return the number of results without performing an extra query.
    # Maybe we could look into this some day. Or maybe we could remove pagination again (and just use a limit), to speed up things a little.
    respond_with(@organisation_clients)
  end

  # GET /organisation_clients/1
  def show
    respond_with(@organisation_client)
  end

  # GET /organisation_clients/new
  def new
    @organisation_client.lat = @organisation.lat
    @organisation_client.lng = @organisation.lng
    respond_with(@organisation_client)
  end

  # GET /organisation_clients/1/edit
  def edit
    respond_with(@organisation_client)
  end

  # POST /organisation_clients
  def create
    @organisation_client.attributes = resource_params
    @organisation_client.save
    respond_with(@organisation, @organisation_client)
  end

  # PATCH/PUT /organisation_clients/1
  def update
    @organisation_client.update_attributes(resource_params)
    respond_with(@organisation, @organisation_client)
  end

  # DELETE /organisation_clients/1
  def destroy
    @organisation_client.destroy
    respond_with(@organisation, OrganisationClient)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @organisation_clients = @organisation.organisation_clients.accessible_by(current_ability, :index).ssp(params)
    when 'autocomplete'
      @organisation_clients = @organisation.organisation_clients.autocomplete_search(params[:q]).page(params[:page]).accessible_by(current_ability, :index)
    when 'new', 'create'
      @organisation_client = @organisation.organisation_clients.build
    else
      @organisation_client = @organisation.organisation_clients.find(params[:id])
    end
  end

  def resource_params
    params.require(:organisation_client).permit(
      :tag_list, :first_name, :infix, :last_name, :email, :phone, :mobile_phone, :route, :street_number, :locality, :administrative_area_level_2, :administrative_area_level_1, :country, :postal_code, :address_type, :lng, :lat,
      documents_attributes: [:id, :document, :document_cache, :remote_document_url, :_destroy])
  end

  def interpolation_options
    { resource_name: @organisation_client.instance_name }
  end
end
