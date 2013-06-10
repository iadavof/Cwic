class OrganisationsController < ApplicationController
  before_action :load_resource
  authorize_resource

  # GET /organisations
  def index
    respond_with(@organisations)
  end

  # GET /organisations/1
  def show
    respond_with(@organisation)
  end

  # GET /organisations/new
  def new
    respond_with(@organisation)
  end

  # GET /organisations/1/edit
  def edit
    respond_with(@organisation)
  end

  # POST /organisations
  def create
    @organisation.attributes = resource_params
    @organisation.save
    respond_with(@organisation)
  end

  # PATCH/PUT /organisations/1
  def update
    @organisation.update_attributes(resource_params)
    respond_with(@organisation)
  end

  # DELETE /organisations/1
  def destroy
    @organisation.destroy
    respond_with(@organisation)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @organisations = Organisation.accessible_by(current_ability, :index)
    when 'new', 'create'
      @organisation = Organisation.new
    else
      @organisation = Organisation.find(params[:id])
    end
  end

  # Only allow a trusted parameter "white list" through.
  def resource_params
    params.require(:organisation).permit(:name, :street, :house_number, :postal_code, :city, :country)
  end

  def interpolation_options
    { resource_name: @organisation.instance_name }
  end
end
