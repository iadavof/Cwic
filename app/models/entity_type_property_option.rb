class EntityTypePropertyOption < ActiveRecord::Base
  # Associations
  belongs_to :entity_type_property
  has_and_belongs_to_many :entity_properties, join_table: 'entity_properties_values', foreign_key: 'value_id'

  # Validations
  validates :entity_type_property, presence: true
  validates :name, presence: true, length: { maximum: 255 }
  validates :index, presence: true, numericality: { only_integer: true }

  # Callbacks
  after_destroy :clear_depending_entity_properties

  # Scopes
  default_scope { order(:index) }

  def instance_name
    self.name
  end

  # We overwrite the errors object with our own error object to support dynamic attribute name in the errors.
  def errors
    @errors ||= EntityTypePropertyOptionErrors.new(self)
  end

  private

  def clear_depending_entity_properties
    # Because of a bug in Rails with regard to default_scopes, associations and update_all, we need to perform this action in an unscoped block.
    EntityProperty.unscoped { self.entity_type_property.entity_properties.where(value: self.id.to_s).update_all(value: nil) }
  end
end

# Our own errors class that add the property's attribute name to the error message.
class EntityTypePropertyOptionErrors < ActiveModel::Errors
  def add(attribute, message = nil, options = {})
    super
    if [:name].include?(attribute)
      message = self[attribute].pop
      if @base.entity_type_property.name.present?
        self[attribute] << "'#{@base.entity_type_property.name}' #{message}"
      else
        self[attribute] << "#{message}"
      end
    end
  end
end
