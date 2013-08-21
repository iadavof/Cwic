class PropertyTypeOption < ActiveRecord::Base
  default_scope { order(:index) }

  belongs_to :property_type
  has_and_belongs_to_many :properties, join_table: 'properties_values', foreign_key: 'value_id'

  validates :property_type, presence: true
  validates :name, presence: true, length: { maximum: 255 }

  after_destroy :clear_depending_properties

  def instance_name
    self.name
  end

  # We overwrite the errors object with our own error object to support dynamic attribute name in the errors.
  def errors
    @errors ||= PropertyTypeOptionErrors.new(self)
  end

private
  def clear_depending_properties
    # Because of a bug in Rails with regard to default_scopes and update_all, we need to perform this action in a block of Property.send(:with_exclusive_scope).
    Property.send(:with_exclusive_scope) { self.property_type.properties.update_all({ value: nil }, { value: self.id.to_s }) }
  end
end

# Our own errors class that add the property's attribute name to the error message.
class PropertyTypeOptionErrors < ActiveModel::Errors
  def add(attribute, message = nil, options = {})
    super
    if [:name].include?(attribute)
      message = self[attribute].pop
      if @base.property_type.name.present?
        self[attribute] << "'#{@base.property_type.name}' #{message}"
      else
        self[attribute] << "#{message}"
      end
    end
  end
end