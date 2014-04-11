class TimeUnit < ActiveRecord::Base
  include I18n::Alchemy

  symbolize :key

  validates :key, presence: true, uniqueness: true, length: { maximum: 255 }
  validates :seconds, numericality: { only_integer: true }, allow_nil: true

  default_scope { order('seconds ASC') }

  def human_name
    I18n.t("time_units.#{key}.name")
  end

  def repetition_name
    I18n.t("time_units.#{key}.repetition_name")
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
