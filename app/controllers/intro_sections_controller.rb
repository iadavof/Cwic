class IntroSectionsController < ApplicationController
  before_action :load_resource
  authorize_resource

  # GET /intro_sections
  def index
    respond_with(@intro_sections)
  end

  # GET /intro_sections/1
  def show
    respond_with(@intro_section)
  end

  # GET /intro_sections/new
  def new
    respond_with(@intro_section)
  end

  # GET /intro_sections/1/edit
  def edit
    respond_with(@intro_section)
  end

  # POST /intro_sections
  def create
    @intro_section.attributes = resource_params
    @intro_section.save
    respond_with(@intro_section)
  end

  # PATCH/PUT /intro_sections/1
  def update
    @intro_section.update_attributes(resource_params)
    respond_with(@intro_section)
  end

  # DELETE /intro_sections/1
  def destroy
    @intro_section.destroy
    respond_with(@intro_section)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @intro_sections = IntroSection.accessible_by(current_ability, :index)
    when 'new', 'create'
      @intro_section = IntroSection.new
    else
      @intro_section = IntroSection.find(params[:id])
    end
  end

  def resource_params
    params.require(:intro_section).permit(:title, :body, :image, :weight, :background_color)
  end

  def interpolation_options
    { resource_name: @intro_section.instance_name }
  end
end
