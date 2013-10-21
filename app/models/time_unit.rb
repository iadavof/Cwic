class TimeUnit < ActiveRecord::Base
  include I18n::Alchemy

  validates :key, presence: true, length: { maximum: 255 }, uniqueness: true
  validates :seconds, numericality: { only_integer: true }, allow_nil: true

  default_scope { order('seconds ASC') }
  scope :common, -> { where(common: true) }

  def human_name
    I18n.t("time_units.#{key}.name")
  end

  def repetition_name
    I18n.t("time_units.#{key}.repetition_name")
  end

  def instance_name
    self.key
  end
end
