class ReservationPeriod < ActiveRecord::Base
  include I18n::Alchemy

  # Associations
  belongs_to :entity_type
  belongs_to :period_unit, class_name: 'TimeUnit'

  # Validations
  validates :entity_type, presence: true
  validates :name, length: { maximum: 255 }
  validates :period_amount, numericality: { only_integer: true, greater_than_or_equal_to: 1 }
  validates :period_unit, presence: true, uniqueness: { scope: [:entity_type, :period_amount] } # TODO uniqueness constraint does not work correctly in combination with period_amount == nil (which is actually 1). Fix this when extending this validation to also include check-in and check-out times.
  validates :price, presence: true, numericality: true

  def instance_name
    name
  end

  def name
    super.presence || default_name
  end

  def period_amount
    super || 1
  end

  def length # Length of the period in seconds
    period_amount * period_unit.seconds
  end

  private

  def default_name
    I18n.t('reservation_period.default_name', unit: period_unit.human_numeral_name.lcfirst, unit_plural: period_unit.human_numeral_name(count: 2).lcfirst, count: period_amount) if period_unit.present?
  end
end
