class ReservationRuleScopeSpan < ActiveRecord::Base
  include I18n::Alchemy

  belongs_to :scope

  validates :scope, presence: true
  # validates :year_from, numericality: { only_integer: true }, allow_nil: true
  # validates :month_from, numericality: { only_integer: true }, allow_nil: true
  # validates :day_from, numericality: { only_integer: true }, allow_nil: true
  # validates :hour_from, numericality: { only_integer: true }, allow_nil: true
  # validates :minute_from, numericality: { only_integer: true }, allow_nil: true
  # validates :year_to, numericality: { only_integer: true }, allow_nil: true
  # validates :month_to, numericality: { only_integer: true }, allow_nil: true
  # validates :day_to, numericality: { only_integer: true }, allow_nil: true
  # validates :hour_to, numericality: { only_integer: true }, allow_nil: true
  # validates :minute_to, numericality: { only_integer: true }, allow_nil: true

  def instance_name
    "#{self.active_from} #{self.active_to}"
  end
end
