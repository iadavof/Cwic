class PropertyTypeOption < ActiveRecord::Base
  default_scope { order(:name) }

  belongs_to :property_type
  has_and_belongs_to_many :properties, join_table: 'properties_values', foreign_key: 'value_id'

  validates :property_type, presence: true
  validates :name, presence: true, length: { maximum: 255 }

  after_destroy :clear_depending_properties

  def instance_name
    self.name
  end

private
  def clear_depending_properties
    # Because of a bug in Rails with regard to default_scopes and update_all, we need to perform this action in a block of Property.send(:with_exclusive_scope).
    Property.send(:with_exclusive_scope) { self.property_type.properties.update_all({ value: nil }, { value: self.id.to_s }) }
  end
end
