# encoding: utf-8

class DocumentUploader < CarrierWave::Uploader::Base

  # Include RMagick or MiniMagick support:
  include CarrierWave::MiniMagick
  include CarrierWave::MimeTypes

  # Choose what kind of storage to use for this uploader:
  storage :file

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    #"uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
    "uploads/#{model.class.to_s.underscore}/organisation_#{model.organisation.id}/#{model.id}"
  end

  process :set_content_type

  version :thumb, :if => :convertable? do
    # Width of 150 and the aspect ratio of A4 page
    process :resize_to_fit => [150, 212]
    process :convert => :png

    def full_filename (for_file = model.source.file)
      super.chomp(File.extname(super)) + '.png'
    end
  end

  def convertable?(new_file)
    new_file.content_type.include?('image') ||
    new_file.content_type.include?('pdf') ||
    new_file.content_type.include?('txt')
  end

  def extension_white_list
    %w(jpg jpeg gif png pdf svg xls xlsx ppt pptx doc docx html eps fla mp3 ai zip rar)
  end

end
