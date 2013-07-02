class PropertyType < ActiveRecord::Base
  include ApplicationHelper # XXX TODO move format_description_with_name_title method to somewhere else?

  default_scope { order(:name) }

  belongs_to :entity_type
  belongs_to :data_type

  has_many :property_type_options, dependent: :destroy, inverse_of: :property_type
  has_many :properties, dependent: :destroy

  validates :entity_type, presence: true
  validates :name, presence: true, length: { maximum: 255 }
  validates :data_type, presence: true

  after_create :create_properties

  accepts_nested_attributes_for :property_type_options, allow_destroy: true

  delegate :cast_value, :parse_value, to: :data_type

  def format_value(value)
    if self.single_option?
      # We are dealing with an option property (enum). Format it by determining the name of the corresponding option.
      (option = self.property_type_options.where(id: value).first) ? option.instance_name : nil
    else
      # We are dealing with a primitive property. Format it by letting its data type format it.
      self.data_type.format_value(value)
    end
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

  def instance_name
    self.name
  end

private
  # Create/preset the new property for old entities of entity_type
  def create_properties
    self.entity_type.entities.each do |entity|
      entity.properties.create(property_type: self, value: self.default_value)
    end
  end
end
