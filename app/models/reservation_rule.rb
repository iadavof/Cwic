class ReservationRule < ActiveRecord::Base
  include I18n::Alchemy

  PERIOD_UNITS = [:quarter, :half_hour, :hour, :day, :week]

  belongs_to :scope, class_name: 'ReservationRuleScope'
  belongs_to :period_unit, class_name: 'TimeUnit'
  belongs_to :price_period_unit, class_name: 'TimeUnit'

  symbolize :reserve_by, in: [:period, :scope, :free], methods: true
  symbolize :price_per, in: [:period, :reservation]

  validates :scope_id, presence: true
  validates :scope, presence: true, if: -> { scope_id.present? }
  validates :reserve_by, presence: true
  validates :period_unit_id, presence: true, if: -> { self.reserve_by == :period }
  validates :period_unit, presence: true, if: -> { period_unit_id.present? }
  validates :period_amount, presence: true, numericality: { only_integer: true }, if: -> { self.reserve_by == :period }
  validates :min_periods, numericality: { only_integer: true, allow_blank: true }
  validates :max_periods, numericality: { only_integer: true, allow_blank: true }
  validates :price, presence: true, numericality: true
  validates :price_per, presence: true
  validates :price_period_unit, presence: true, if: -> { price_period_unit_id.present? }
  validates :price_period_amount, numericality: { only_integer: true, allow_blank: true }

  def valid_period_units
    TimeUnit.where(key: PERIOD_UNITS)
  end

  def instance_name
    "#{self.class.model_name.human} #{self.id}"
  end
end
