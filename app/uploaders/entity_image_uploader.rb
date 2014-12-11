# encoding: utf-8

class EntityImageUploader < CarrierWave::Uploader::Base

  # Include RMagick or MiniMagick support:
  include CarrierWave::MiniMagick
  include CarrierWave::MimeTypes

  # Choose what kind of storage to use for this uploader:
  storage :file
  # storage :fog

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  # Provide a default URL as a default if there hasn't been a file uploaded:
  def default_url
    ActionController::Base.helpers.asset_path("fallback/" + [version_name, "entity_image_no_image.png"].compact.join('_'))
  end

  process :set_content_type

  # Process files as they are uploaded:
  process resize_to_limit: [1920, 1080]

  # Create different versions of your uploaded files:
  version :thumb do
     process resize_to_fit: [150, 150]
   end

  version :galery do
    process resize_to_fit: [640, 480]
  end

  version :list do
    process resize_to_fit: [320, 240]
  end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  def extension_white_list
    %w(jpg jpeg gif png)
  end

end
