class FeedbackAndScreencapsController < ApplicationController
  authorize_resource

  # GET /feedback_and_screencaps
  # GET /feedback_and_screencaps.json
  def index
    @feedback_and_screencaps = FeedbackAndScreencap.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @feedback_and_screencaps }
    end
  end

  # GET /feedback_and_screencaps/1
  # GET /feedback_and_screencaps/1.json
  def show
    @feedback_and_screencap = FeedbackAndScreencap.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @feedback_and_screencap }
    end
  end

  # POST /feedback_and_screencaps
  # POST /feedback_and_screencaps.json
  def create
    @feedback_and_screencap = FeedbackAndScreencap.new
    @feedback_and_screencap.attributes = resource_params

    @feedback_and_screencap.screencap = URI.unescape(resource_params[:screencap])

    respond_to do |format|
      if @feedback_and_screencap.save
        format.html { redirect_to @feedback_and_screencap, notice: 'Feedback and screencap was successfully created.' }
        format.json { render json: @feedback_and_screencap, status: :created, location: @feedback_and_screencap }
      else
        format.html { render action: "new" }
        format.json { render json: @feedback_and_screencap.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /feedback_and_screencaps/1
  # DELETE /feedback_and_screencaps/1.json
  def destroy
    @feedback_and_screencap = FeedbackAndScreencap.find(params[:id])
    @feedback_and_screencap.destroy

    respond_to do |format|
      format.html { redirect_to feedback_and_screencaps_url }
      format.json { head :no_content }
    end
  end

  protected

  def resource_params
    params.require(:feedback_and_screencap).permit(:message, :screencap)
  end
end
