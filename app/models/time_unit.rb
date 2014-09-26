class TimeUnit < ActiveRecord::Base
  # Attribute modifiers
  symbolize :key

  # Validations
  validates :key, presence: true, uniqueness: true, length: { maximum: 255 }
  validates :seconds, numericality: { only_integer: true }, allow_nil: true

  default_scope { order('seconds ASC') }

  def instance_name
    self.key
  end

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

  def ==(other)
    if other.is_a?(Symbol)
      self.key == other.to_s
    else
      super
    end
  end
end
