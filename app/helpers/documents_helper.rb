module DocumentsHelper
  def get_document_icon_for_extension(extension)
    extension = extension.downcase
    if (%w(xlsx pptx docx)).include?(extension)
      return extension[0..2]
    elsif (%w(jpg jpeg gif png pdf svg xls ppt doc html eps fla mp3 ai zip rar)).include?(extension)
      return extension
    else
      return 'unknown'
    end
  end

  def get_document_icon_url_for_extension(extension)
    icon_name = get_document_icon_for_extension(extension)
    ActionController::Base.helpers.asset_path('images/document_icons/' + icon_name + '.png')
  end
end
