# encoding: utf-8

class DocumentUploader < CarrierWave::Uploader::Base
  # Include RMagick or MiniMagick support:
  include CarrierWave::MiniMagick
  include CarrierWave::MimeTypes

  # Choose what kind of storage to use for this uploader:
  storage :file
  after :remove, :delete_empty_upstream_dirs

  # Override the directory where uploaded files will be stored.
  def store_dir
    "#{base_store_dir}/#{model.id}"
  end

  def base_store_dir
    "uploads/#{model.class.to_s.underscore}/organisation_#{model.organisation.id}/"
  end

  def delete_empty_upstream_dirs
    path = ::File.expand_path(store_dir, root)
    Dir.delete(path) # fails if path not empty dir

    path = ::File.expand_path(base_store_dir, root)
    Dir.delete(path) # fails if path not empty dir
  rescue SystemCallError
    true # nothing, the dir is not empty
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
    # Archive extensions
    %w(tar zip rar gz 7z bz2) +
    # Bitmap image extensions
    %w(jpg jpeg gif png bmp) +
    # Vector image extensions
    %w(svg wmf emf) +
    # Audio extensions
    %w(mp3) +
    # Web extensions
    %w(htm html xml) +
    # Document extensions
    %w(txt rtf) +
    # OpenDocument extensions
    %w(odt ods odp odg odc odf odi odm ott ots otp otg otc otf oti oth) +
    # Microsoft Office extensions
    %w(doc docx docm docb xls xlm xlw xlsx xlsm xlsb ppt pps pptx pptm ppsx ppsm sldx sldm dot dotx dotm xlt xltx xltm pot potx potm) +
    # Adobe extensions
    %w(psd ai eps indd pdf)
  end

end
