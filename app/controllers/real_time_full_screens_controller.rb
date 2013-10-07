class RealTimeFullScreensController < ApplicationController
  before_action :load_resource
  authorize_resource

  # GET /real_time_full_screens
  def index
    respond_with(@real_time_full_screens)
  end

  # GET /real_time_full_screens/1
  def show
    respond_with(@real_time_full_screen)
  end

  # GET /real_time_full_screens/new
  def new
    respond_with(@real_time_full_screen)
  end

  # GET /real_time_full_screens/1/edit
  def edit
    respond_with(@real_time_full_screen)
  end

  # POST /real_time_full_screens
  def create
    @real_time_full_screen.attributes = resource_params
    @real_time_full_screen.save
    respond_with(@real_time_full_screen)
  end

  # PATCH/PUT /real_time_full_screens/1
  def update
    @real_time_full_screen.update_attributes(resource_params)
    respond_with(@real_time_full_screen)
  end

  # DELETE /real_time_full_screens/1
  def destroy
    @real_time_full_screen.destroy
    respond_with(@real_time_full_screen)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @real_time_full_screens = RealTimeFullScreen.accessible_by(current_ability, :index)
    when 'new', 'create'
      @real_time_full_screen = RealTimeFullScreen.new
    else
      @real_time_full_screen = RealTimeFullScreen.find(params[:id])
    end
  end

  def resource_params
    params.require(:real_time_full_screen).permit(:name, :public)
  end

  def interpolation_options
    { resource_name: @real_time_full_screen.instance_name }
  end
end
