module DocumentsHelper
  def document_icon_for_extension(extension)
    extension = extension.downcase
    if (%w(tar zip rar gz 7z bz2)).include?(extension)
      return 'zip'
    elsif (%w(jpg jpeg gif png bmp svg wmf emf psd ai eps)).include?(extension)
      return 'photo'
    elsif (%w(mp3)).include?(extension)
      return 'sound'
    elsif (%w(htm html xml)).include?(extension)
      return 'code'
    elsif (%w(txt rtf odt ods odp odg odc odf odi odm ott ots otp otg otc otf oti oth indd)).include?(extension)
      return 'text'
    elsif (%w(doc docx docm docb dot dotx dotm)).include?(extension)
      return 'word'
    elsif (%w(xls xlm xlw xlsx xlsm xlsbxlt xltx xltm)).include?(extension)
      return 'excel'
    elsif (%w(ppt pps pptx pptm ppsx ppsm sldx sldm pot potx potm)).include?(extension)
      return 'powerpoint'
    elsif (%w(pdf)).include?(extension)
      return 'pdf'
    else
      return 'file'
    end
  end

  def document_icon_url_for_extension(extension)
    icon_name = document_icon_for_extension(extension)
    asset_url("document_icons/#{icon_name}.png")
  end
end
