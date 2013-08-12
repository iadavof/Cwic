class PropertyType < ActiveRecord::Base
  default_scope { order(:name) }

  belongs_to :entity_type
  belongs_to :data_type

  has_many :property_type_options, dependent: :destroy, inverse_of: :property_type
  has_many :properties, dependent: :destroy

  validates :entity_type, presence: true
  validates :name, presence: true, length: { maximum: 255 }
  validates :data_type, presence: true

  validates :default_value, length: { maximum: 255 }, allow_blank: true, if: :string?
  validates :default_value, numericality: { only_integer: true }, allow_blank: true, if: :integer?
  validates :default_value, numericality: true, allow_blank: true, if: :float?

  after_find :cast_default_value
  before_validation :parse_default_value

  after_create :create_properties

  accepts_nested_attributes_for :property_type_options, allow_destroy: true

  delegate :string?, :integer?, :float?, :cast_value, :parse_value, to: :data_type

  def format_value(value)
    if self.single_option?
      # We are dealing with an option property (enum). Format it by determining the name of the corresponding option.
      (option = self.property_type_options.where(id: value).first) ? option.instance_name : nil
    else
      # We are dealing with a primitive property. Format it by letting its data type format it.
      self.data_type.format_value(value)
    end
  end

  def has_options?
    self.single_option? || self.multiple_options?
  end

  def single_option?
    case self.data_type.key
    when 'enum'
      true
    else
      false
    end
  end

  def multiple_options?
    case self.data_type.key
    when 'set'
      true
    else
      false
    end
  end

  def formatted_default_value
    if self.has_options?
      # We are dealing with an option property (enum/set). Format it by determining the name of the corresponding option.
      self.property_type_options.where(default: true).map(&:instance_name).to_sentence
    else
      # We are dealing with a primitive property. Format it by letting its data type format it.
      self.format_value(self.default_value)
    end
  end

  def form_default_value
    return nil if self.data_type.nil? # New property type that does not have a data type (yet)
    case self.data_type.key
    when 'integer', 'float'
      self.format_value(self.default_value)
    else
      self.default_value
    end
  end

  def instance_name
    self.name
  end

  # We overwrite the errors object with our own error object to support dynamic attribute name in the errors.
  def errors
    @errors ||= PropertyTypeErrors.new(self)
  end

private
  def cast_default_value
    self.default_value = self.cast_value(self.default_value)
  end

  def parse_default_value
    self.default_value = self.parse_value(self.default_value)
  end

  # Create/preset the new property for old entities of entity_type
  def create_properties
    self.entity_type.entities.each do |entity|
      entity.properties.create(property_type: self, value: self.default_value)
    end
  end
end

# Our own errors class that add the property's attribute name to the error message.
class PropertyTypeErrors < ActiveModel::Errors
  def add(attribute, message = nil, options = {})
    super
    if attribute == :default_value
      message = self[attribute].pop
      self[attribute] << "'#{@base.name}' #{message}"
    end
  end
end