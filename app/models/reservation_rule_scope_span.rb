class ReservationRuleScopeSpan < ActiveRecord::Base
  include I18n::Alchemy

  belongs_to :scope

  validates :scope, presence: true
  validates :year_from, numericality: { only_integer: true }, allow_nil: true
  validates :month_from, numericality: { only_integer: true }, allow_nil: true
  validates :dom_from, numericality: { only_integer: true }, allow_nil: true
  validates :nrom_from, numericality: { only_integer: true }, allow_nil: true
  validates :week_from, numericality: { only_integer: true }, allow_nil: true
  validates :dow_from, numericality: { only_integer: true }, allow_nil: true
  validates :holiday_from, inclusion: { in: proc { |record| record.relevant_holidays_keys() } }, allow_nil: true
  validates :hour_from, numericality: { only_integer: true }, allow_nil: true
  validates :minute_from, numericality: { only_integer: true }, allow_nil: true
  validates :year_to, numericality: { only_integer: true }, allow_nil: true
  validates :month_to, numericality: { only_integer: true }, allow_nil: true
  validates :dom_to, numericality: { only_integer: true }, allow_nil: true
  validates :nrom_to, numericality: { only_integer: true }, allow_nil: true
  validates :week_to, numericality: { only_integer: true }, allow_nil: true
  validates :dow_to, numericality: { only_integer: true }, allow_nil: true
  validates :holiday_to, inclusion: { in: proc { |record| record.relevant_holidays_keys() } }, allow_nil: true
  validates :hour_to, numericality: { only_integer: true }, allow_nil: true
  validates :minute_to, numericality: { only_integer: true }, allow_nil: true

  normalize_attributes :holiday_from, :holiday_to

  def relevant_holidays
    Holidays.between(Date.today.beginning_of_year, Date.today.end_of_year, I18n.locale)
  end

  def relevant_holidays_keys
    relevant_holidays.map { |h| h[:key] }
  end

  def instance_name
    "TODO"
  end
end
