class Property < ActiveRecord::Base
  default_scope { includes(:property_type).order('property_types.name') }

  belongs_to :entity
  belongs_to :property_type
  has_and_belongs_to_many :values, class_name: 'PropertyTypeOption', join_table: 'properties_values', association_foreign_key: 'value_id'

  validates :entity, presence: true
  validates :property_type, presence: true

  validates :value, presence: true, if: :required?
  validates :value, length: { maximum: 255 }, allow_blank: true, if: :string?
  validates :value, numericality: { only_integer: true }, allow_blank: true, if: :integer?
  validates :value, numericality: true, allow_blank: true, if: :float?

  after_find :cast_value
  before_validation :parse_value

  delegate :single_option?, :multiple_options?, to: :property_type

  def formatted_value
    if self.multiple_options?
      # We are dealing with a option values property (set). Format it by rendering the values array.
      self.values.map(&:instance_name).to_sentence
    else
      # We are dealing with a simple single value property (primitive type or enum). Format it by letting the property type format it.
      self.property_type.format_value(self.value)
    end
  end

  def instance_name
    self.property_type.instance_name
  end

  # We overwrite the errors object with our own error object to support dynamic attribute name in the errors.
  def errors
    @errors ||= Errors.new(self)
  end

private
  def cast_value
    if self.multiple_options?
      self.value = self.values.present? # To fix the required validation for multiple option properties.
    else
      self.value = self.property_type.cast_value(self.value)
    end
  end

  def parse_value
    if self.multiple_options?
      self.value = self.values.present? ? true : nil # To fix the required validation for multiple option properties.
    else
      self.value = self.property_type.parse_value(self.value)
    end
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