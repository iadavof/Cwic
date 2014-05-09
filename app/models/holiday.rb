class Holiday < ActiveRecord::Base
  symbolize :region

  validates :region, presence: true, length: { maximum: 255 }
  validates :key, presence: true, uniqueness: { scope: :locale }, length: { maximum: 255 }
  validates :gem_name, presence: true, length: { maximum: 255 }
  validates :gem_offset, numericality: { only_integer: true, allow_nil: true }

  # Import all holidays for a region with the available holidays in this year
  def self.import_holidays(region, force = false)
    raise "This method is deprecated. Use the seeds to import holidays."
    if force
      Holiday.where(region: region).destroy_all
    else
      raise "There are already holidays present for region #{region}" if Holiday.where(region: region).exists? && !force
    end
    offsets = {}
    Holidays.between(Date.today.beginning_of_year, Date.today.end_of_year, region).each do |holiday|
      name = holiday[:name]
      offsets[name] = (offsets[name].present? ? offsets[name] + 1 : 0)
      Holiday.create!(region: region, key: name, gem_name: name, gem_offset: offsets[name])
    end
  end

  def human_name
    localized_name = I18n.t("holidays.region.#{key}", default: nil)
    region_name = I18n.t("holidays.region.#{key}", default: key, locale: self.region)
    if self.locale != I18n.current_locale && localized_name.present?
      "#{region_name} (#{localized_name})"
    else
      region_name
    end
  end

  def instance_name
    "#{self.locale} #{self.key}"
  end
end
