# encoding: utf-8

class DocumentUploader < CarrierWave::Uploader::Base

  # Include RMagick or MiniMagick support:
  include CarrierWave::MiniMagick

  # Choose what kind of storage to use for this uploader:
  storage :file

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    #"uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
    "uploads/#{model.class.to_s.underscore}/organisation_#{model.organisation.id}/#{model.id}"
  end

  def first_page
    manipulate! do |frame, index|
      frame if index.zero?
    end
  end

  version :thumb do
    process :first_page
    process :resize_to_fit => [200, 200]
    process :convert => :jpg

    def full_filename (for_file = model.source.file)
      super.chomp(File.extname(super)) + '.jpg'
    end
  end

end
