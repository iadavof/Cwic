module Vcardable
  extend ActiveSupport::Concern

  def vcard_filename(name = nil)
    name ||= instance_name
    "#{URI::encode(name.gsub(/\s+/, "_").gsub(/[^0-9a-z_]/i, ''))}.vcf"
  end
end
