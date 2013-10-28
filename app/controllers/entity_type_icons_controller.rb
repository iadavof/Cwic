class EntityTypeIconsController < ApplicationController
  before_action :load_resource
  before_action :update_menu
  authorize_resource

  # GET /entity_type_icons
  def index
    respond_with(@organisation.present? ? [@organisation, @entity_type_icons] : @entity_type_icons)
  end

  # GET /entity_type_icons/1
  def show
    respond_with(@organisation.present? ? [@organisation, @entity_type_icon] : @entity_type_icon)
  end

  # GET /entity_type_icons/new
  def new
    respond_with(@organisation.present? ? [@organisation, @entity_type_icon] : @entity_type_icon)
  end

  # GET /entity_type_icons/1/edit
  def edit
    respond_with(@organisation.present? ? [@organisation, @entity_type_icon] : @entity_type_icon)
  end

  # POST /entity_type_icons
  def create
    @entity_type_icon.attributes = resource_params
    if @admin
      if params[:organisation_id] == ""
        @entity_type_icon.organisation = nil
      end
    else
        @entity_type_icon.organisation = @organisation
    end
    @entity_type_icon.save
    respond_with(@organisation.present? ? [@organisation, @entity_type_icon] : @entity_type_icon)
  end

  # PATCH/PUT /entity_type_icons/1
  def update
    @entity_type_icon.update_attributes(resource_params)
    puts @admin.inspect
    if @admin
      if params[:organisation_id] == ""
        @entity_type_icon.organisation = nil
      end
    else
        @entity_type_icon.organisation = @organisation
    end
    @entity_type_icon.save
    respond_with(@organisation.present? ? [@organisation, @entity_type_icon] : @entity_type_icon)
  end

  # DELETE /entity_type_icons/1
  def destroy
    @entity_type_icon.destroy
    respond_with(@organisation.present? ? [@organisation, @entity_type_icon] : @entity_type_icon)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      if @organisation.present?
        @entity_type_icons = @organisation.entity_type_icons.accessible_by(current_ability, :index)
      else
        @entity_type_icons = EntityTypeIcon.accessible_by(current_ability, :index)
      end
    when 'new', 'create'
      if @organisation.present?
        @entity_type_icon = @organisation.entity_type_icons.build
      else
        @entity_type_icon = EntityTypeIcon.new
      end
    else
      if @organisation.present?
        @entity_type_icon = @organisation.entity_type_icons.find(params[:id])
      else
        @entity_type_icon = EntityTypeIcon.find(params[:id])
      end
    end
  end

  def update_menu
    if @organisation.present?
      @current_menu_category = :settings
      @current_menu_sub_category = :entity_types
      @current_menu_link = :custom_icons
    end
  end

  def resource_params
    if @admin
      params.require(:entity_type_icon).permit(:name, :organisation_id, :image, :image_cache, :remote_image_url, :remove_image)
    else
      params.require(:entity_type_icon).permit(:name, :image, :image_cache, :remote_image_url, :remove_image)
    end
  end

  def interpolation_options
    { resource_name: @entity_type_icon.instance_name }
  end
end
