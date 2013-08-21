class EntityType < ActiveRecord::Base
  has_many :entities, dependent: :destroy
  has_many :entity_type_properties, dependent: :destroy, inverse_of: :entity_type

  belongs_to :entity_type_icon

  validates :name, presence: true, length: { maximum: 255 }

  accepts_nested_attributes_for :entity_type_properties, allow_destroy: true

  def entity_type_icon_with_default
    if self.entity_type_icon_without_default.nil?
      EntityTypeIcon.first
    else
      self.entity_type_icon_without_default
    end
  end
  alias_method_chain :entity_type_icon, :default

  def instance_name
    self.name
  end
end
