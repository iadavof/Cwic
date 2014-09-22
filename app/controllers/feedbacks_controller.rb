class FeedbacksController < CrudController
  require 'digest/md5'

  before_action :build_screen_capture, only: :create

  respond_to :html, only: [:index, :show, :destroy]
  respond_to :json, only: [:create]

private
  def permitted_params
    [:message, :specs, :screen_capture]
  end

  def collection_includes
    [:user, :organisation]
  end

  # Build screen capture file from raw image data
  def build_screen_capture
    raw_image_data = member_params[:screen_capture]
    if raw_image_data.present?
      # Create a new tempfile named fileupload
      tempfile = Tempfile.new('fileupload')
      tempfile.binmode

      # Get the raw image data and decode it with base64 then write it to the tempfile
      tempfile.write(Base64.decode64(URI::unescape(raw_image_data)[22..-1]))
      tempfile.close

      # Create a new uploaded file
      filename = "#{Digest::MD5.hexdigest(raw_image_data)}.png"
      @feedback.screen_capture = ActionDispatch::Http::UploadedFile.new(tempfile: tempfile, filename: filename, type: 'image/png')
    end
  end
end
