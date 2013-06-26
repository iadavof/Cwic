class Property < ActiveRecord::Base
  default_scope { includes(:property_type).order('property_types.name') }
  belongs_to :entity
  belongs_to :property_type

  validates :entity, presence: true
  validates :property_type, presence: true

  validates :value, presence: true, if: :required?
  validates :value, length: { maximum: 255 }, allow_blank: true, if: :string?
  validates :value, numericality: { only_integer: true }, allow_blank: true, if: :integer?
  validates :value, numericality: true, allow_blank: true, if: :decimal?

  delegate :cast_value, :parse_value, :format_value, to: :property_type

  after_find do
    self.value = cast_value(self.value)
  end

  before_validation do
    self.value = parse_value(self.value)
  end

  def formatted_value
    self.format_value(self.value)
  end

  def required?
    self.property_type.required?
  end

  def string?
    self.property_type.data_type.key == 'string'
  end

  def integer?
    self.property_type.data_type.key == 'integer'
  end

  def decimal?
    self.property_type.data_type.key == 'decimal'
  end

  def instance_name
    self.property_type.instance_name
  end
end
