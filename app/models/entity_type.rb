class EntityType < ActiveRecord::Base
  has_many :property_types, dependent: :destroy, inverse_of: :entity_type

  validates :name, presence: true, length: { maximum: 255 }

  accepts_nested_attributes_for :property_types, allow_destroy: true

  def instance_name
    self.name
  end
end
