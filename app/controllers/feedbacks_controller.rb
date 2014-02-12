class FeedbacksController < ApplicationController

  require 'digest/md5'

  before_action :load_resource
  authorize_resource

  respond_to :html, only: [:index, :show]
  respond_to :json, only: [:create]

  # GET /feedbacks
  def index
    respond_with(@feedbacks)
  end

  # GET /feedbacks/1
  def show
    respond_with(@feedback)
  end

  # POST /feedbacks
  def create

    # Check if file is within picture_path
  if params[:feedback][:screen_capture]
    screen_capture_params = params[:feedback][:screen_capture]
    # Create a new tempfile named fileupload
    tempfile = Tempfile.new("fileupload")
    tempfile.binmode
    # Get the file and decode it with base64 then write it to the tempfile
    tempfile.write(Base64.decode64(URI::unescape(screen_capture_params)[22..-1]))
    tempfile.close
    # Create a new uploaded file
    filehash = Digest::MD5.hexdigest(screen_capture_params) + '.png';
    uploaded_file = ActionDispatch::Http::UploadedFile.new(tempfile: tempfile, filename: filehash, type: 'image/png')
    uploaded_file.inspect
    # Replace picture_path with the new uploaded file
    params[:feedback][:screen_capture] =  uploaded_file
  end

    @feedback.attributes = resource_params
    @feedback.user = current_user
    @feedback.organisation = current_organisation
    @feedback.save
    respond_with(@feedback)
  end

  # DELETE /feedbacks/1
  def destroy
    @feedback.destroy
    respond_with(@feedback)
  end

private
  def load_resource
    case params[:action]
    when 'index'
      @feedbacks = Feedback.accessible_by(current_ability, :index)
    when 'create'
      @feedback = Feedback.new
    else
      @feedback = Feedback.find(params[:id])
    end
  end

  def resource_params
    params.require(:feedback).permit(:message, :specs, :screen_capture)
  end

  def interpolation_options
    { resource_name: @feedback.instance_name }
  end
end
