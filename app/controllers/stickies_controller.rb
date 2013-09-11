class StickiesController < ApplicationController
  before_action :load_resource
  authorize_resource

  respond_to :json

  # GET /stickies_for
  def stickies_for
    stickies = []
    @stickies.each do |st|
      stickies << st.json_representation
    end
    render json: stickies, status: :ok
  end

  # POST /stickies
  def create
    @sticky.localized.attributes = resource_params
    @sticky.weight = 0
    @sticky.save
    respond_with(@organisation, @sticky) do |format|
      format.json { render json: @sticky.json_representation }
    end
  end

  def weight_update
    @stickies.each do |st|
      st.weight = params[:new_weight_ids].index(st.id.to_s)
      st.save
    end
    render json: nil, status: :ok
  end

  # PATCH/PUT /stickies/1
  def update
    @sticky.localized.update_attributes(resource_params)
    respond_with(@organisation, @sticky) do |format|
      format.json { render json: nil }
    end
  end

  # DELETE /stickies/1
  def destroy
    @sticky.destroy
    respond_with(@organisation, @sticky) do |format|
      format.json { render json: nil }
    end
  end

private
  def load_resource
    case params[:action]
    when 'weight_update'
      @stickies = @organisation.stickies.accessible_by(current_ability, :index).find(params[:new_weight_ids]);
    when 'stickies_for', 'create'
      @stickies = []
      item = nil
      resource = params[:resource]
      if resource.present?
        item = resource.classify.constantize.find(params[:rid])
        if item.present? && item.stickies.present?
          @stickies = item.stickies
        end
      end

      if params[:action] == 'create' && item
        @sticky = @organisation.stickies.build
        @sticky.stickable = item
        @sticky.user = current_user
      end
    else
      @sticky = Sticky.find(params[:id])
    end
  end

  def resource_params
    params.require(:sticky).permit(:sticky_text)
  end

  def interpolation_options
    { resource_name: @sticky.instance_name }
  end
end
