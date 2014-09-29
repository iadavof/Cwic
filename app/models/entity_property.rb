class EntityProperty < ActiveRecord::Base
  # Associations
  belongs_to :entity
  belongs_to :property_type, class_name: 'EntityTypeProperty'
  has_and_belongs_to_many :values, class_name: 'EntityTypePropertyOption', join_table: 'entity_properties_values', association_foreign_key: 'value_id'

  # Model extensions
  delegate :required?, :string?, :integer?, :float?, :has_options?, :single_option?, :multiple_options?, to: :property_type

  # Validations
  validates :entity, presence: true
  validates :property_type, presence: true
  validates :value, presence: true, if: :required?
  validates :value, length: { maximum: 255 }, allow_blank: true, if: :string?
  validates :value, numericality: { only_integer: true }, allow_blank: true, if: :integer?
  validates :value, numericality: true, allow_blank: true, if: :float?

  # Callbacks
  after_find :cast_value
  after_initialize :init, if: :new_record?
  before_validation :parse_value

  # Scopes
  default_scope { includes(:property_type).order('entity_type_properties.name') }

  def init
    set_default_value if self.value.nil? && self.values.empty? # Set default value if value is not already set
  end

  def instance_name
    self.property_type.instance_name
  end

  def formatted_value
    if self.multiple_options?
      # We are dealing with a option values property (set). Format it by rendering the values array.
      self.values.map(&:instance_name).to_sentence
    else
      # We are dealing with a simple single value property (primitive type or enum). Format it by letting the entity_property type format it.
      self.property_type.format_value(self.value)
    end
  end

  def set_value(value)
    if self.has_options? && !value.nil?
      values = [value].flatten
      raise "Not all values are of the same type" if values.map(&:class).uniq.size > 1
      if values.first.is_a?(EntityTypePropertyOption)
        values = values
      elsif values.first.is_a?(Fixnum)
        values = self.property_type.options.find(values)
      elsif values.first.is_a?(String)
        values = self.property_type.options.where(name: values)
      end
      if self.single_option?
        self.value = values.first.id
      else
        self.values = values
      end
    else
      self.value = value
    end
  end

  # We overwrite the errors object with our own error object to support dynamic attribute name in the errors.
  def errors
    @errors ||= EntityPropertyErrors.new(self)
  end

  private

  def cast_value
    if self.multiple_options?
      self.value = self.values.present? # Needed to let the required validation for multiple option properties work.
    else
      self.value = self.property_type.cast_value(self.value)
    end
  end

  def set_default_value
    return if self.property_type.nil?
    if self.multiple_options?
      default = self.property_type.options.where(default: true)
    elsif self.single_option?
      default = self.property_type.options.where(default: true).first
    else
      default = self.property_type.default_value
    end
    self.set_value(default)
  end

  def parse_value
    if self.multiple_options?
      self.value = self.values.present? ? true : nil # Needed to let the required validation for multiple option properties work.
    else
      self.value = self.property_type.parse_value(self.value)
    end
  end
end

# Our own errors class that add the entity_property's attribute name to the error message.
class EntityPropertyErrors < ActiveModel::Errors
  def add(attribute, message = nil, options = {})
    super
    if attribute == :value
      message = self[attribute].pop
      self[attribute] << "'#{@base.property_type.name}' #{message}"
    end
  end
end
