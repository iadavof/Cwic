class InfoScreensController < ApplicationController
  before_action :load_resource
  authorize_resource

  # GET /info_screens
  def index
    respond_with(@info_screens)
  end

  # GET /info_screens/1
  def show
    respond_with(@info_screen)
  end

  # GET /info_screens/new
  def new
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
      @info_screens = InfoScreen.accessible_by(current_ability, :index)
    when 'new', 'create'
      @info_screen = InfoScreen.new
    else
      @info_screen = InfoScreen.find(params[:id])
    end
  end

  def resource_params
    params.require(:info_screen).permit(:name, :public)
  end

  def interpolation_options
    { resource_name: @info_screen.instance_name }
  end
end
