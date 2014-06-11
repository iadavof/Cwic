class TimeUnit < ActiveRecord::Base
  symbolize :key

  validates :key, presence: true, uniqueness: true, length: { maximum: 255 }
  validates :seconds, numericality: { only_integer: true }, allow_nil: true

  default_scope { order('seconds ASC') }
  scope :common, -> { where(common: true) } # TODO remove this (instead just select the units you want yourself). This was going to be used in Reservation Rules, but is at the moment not used anymore.

  def human_name(options = {})
    options = { count: 1 }.merge!(options)
    I18n.t("time_units.#{key}.name", options)
  end

  def human_numeral_name(options = {})
    options = { count: 1 }.merge!(options)
    I18n.t("time_units.#{key}.numeral_name", options)
  end

  def human_repetition_name(options = {})
    I18n.t("time_units.#{key}.repetition_name", options)
  end

  def instance_name
    self.key
  end

  def ==(other)
    if other.is_a?(Symbol)
      self.key == other.to_s
    else
      super
    end
  end
end
