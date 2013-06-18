class Property < ActiveRecord::Base
  default_scope includes(:property_type).order('property_types.name')
  belongs_to :entity
  belongs_to :property_type

  validates :entity, presence: true
  validates :property_type, presence: true

  def instance_name
    self.property_type.instance_name
  end
end
