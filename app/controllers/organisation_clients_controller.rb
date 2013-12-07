class OrganisationClientsController < ApplicationController
  before_action :load_resource
  authorize_resource

  respond_to :html, except: :autocomplete_search
  respond_to :json, only: :autocomplete_search

  # GET /organisation_clients
  def index
    respond_with(@organisation_clients)
  end

  def autocomplete_search
    # IMPROVEMENT: Kaminari performs two queries: one for total number of results and one to get results in scope.
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
      if params[:mini_search].present?
        @organisation_clients = @organisation.organisation_clients.global_search(params[:mini_search]).accessible_by(current_ability, :index).page(params[:page])
        # if no results, check if not a page is selected that does not exist
        unless @organisation_clients.present?
          @organisation_clients = @organisation.organisation_clients.global_search(params[:mini_search]).accessible_by(current_ability, :index).page(1)
        end
      else
        @organisation_clients = @organisation.organisation_clients.accessible_by(current_ability, :index).page(params[:page])
        # if no results, check if not a page is selected that does not exist
        unless @organisation_clients.present?
          @organisation_clients = @organisation.organisation_clients.accessible_by(current_ability, :index).page(1)
        end
      end
    when 'autocomplete_search'
      @organisation_clients = @organisation.organisation_clients.autocomplete_search(params[:q]).page(params[:page]).accessible_by(current_ability, :index)
    when 'new', 'create'
      @organisation_client = @organisation.organisation_clients.build
    else
      @organisation_client = @organisation.organisation_clients.find(params[:id])
    end
  end

  def resource_params
    params.require(:organisation_client).permit(:first_name, :infix, :last_name, :email, :phone, :mobile_phone, :route, :street_number, :locality, :administrative_area_level_2, :administrative_area_level_1, :country, :postal_code, :address_type, :lng, :lat)
  end

  def interpolation_options
    { resource_name: @organisation_client.instance_name }
  end
end
