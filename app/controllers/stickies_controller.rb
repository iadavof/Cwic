class StickiesController < ApplicationController
  before_action :load_resource
  authorize_resource

  respond_to :html, :json

  # GET /stickies_for
  def stickies_for
    respond_with(@stickies)
  end

  # POST /stickies
  def create
    if params[:resource].present? && params[:rid].present?
      resource = params[:resource].classify;
      if resource.present?
        item = resource.find(params[:rid])
        if item.present?
          @sticky.stickable = item
        end
      end
    end
    @sticky.localized.attributes = resource_params
    @sticky.save
    respond_with(@sticky)
  end

  # PATCH/PUT /stickies/1
  def update
    @sticky.localized.update_attributes(resource_params)
    respond_with(@sticky)
  end

  # DELETE /stickies/1
  def destroy
    @sticky.destroy
    respond_with(@sticky)
  end

private
  def load_resource
    case params[:action]
    when 'create'
      @sticky = Sticky.new
    when 'stickies_for'
      @stickies = nil
      resource = params[:resource];
      if resource.present?
        item = resource.classify.constantize.find(params[:rid])
        if item.present?
          @stickies = item.stickies
        end
      end
    else
      @sticky = Sticky.find(params[:id])
    end
  end

  def resource_params
    params.require(:sticky).permit(:stickable_id, :user_id, :sticky_text, :pos_x, :pos_y, :width, :height)
  end

  def interpolation_options
    { resource_name: @sticky.instance_name }
  end
end
