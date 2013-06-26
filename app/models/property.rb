class Property < ActiveRecord::Base
  default_scope { includes(:property_type).order('property_types.name') }

  belongs_to :entity
  belongs_to :property_type

  validates :entity, presence: true
  validates :property_type, presence: true

  validates :value, presence: true, if: :required?
  validates :value, length: { maximum: 255 }, allow_blank: true, if: :string?
  validates :value, numericality: { only_integer: true }, allow_blank: true, if: :integer?
  validates :value, numericality: true, allow_blank: true, if: :float?

  after_find :cast_value
  before_validation :parse_value

  def cast_value
    self.value = self.property_type.cast_value(self.value)
  end

  def parse_value
    self.value = self.property_type.parse_value(self.value)
  end

  def formatted_value
    self.property_type.format_value(self.value)
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

  def float?
    self.property_type.data_type.key == 'float'
  end

  def instance_name
    self.property_type.instance_name
  end

  # We overwrite the errors object with our own error object to support dynamic attribute name in the errors.
  def errors
    @errors ||= Errors.new(self)
  end
end

# Our own errors class that add the property's attribute name to the error message.
class Errors < ActiveModel::Errors
  def add(attribute, message = nil, options = {})
    super
    if attribute == :value
      message = self[attribute].pop
      self[attribute] << "'#{@base.property_type.name}' #{message}"
    end
  end
end