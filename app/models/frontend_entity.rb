class FrontendEntity < ActiveRecord::Base
  # Associations
  belongs_to :frontend_entity_type
  belongs_to :entity

  # Validations
  validates :frontend_entity_type, presence: true
  validates :entity, presence: true

  # Scopes
  scope :active, -> { joins(:frontend_entity_type).where(frontend_entity_types: { active: true }, active: true) }

  def instance_name
    self.entity.instance_name
  end

  def active?
    read_attribute(:active) && frontend_entity_type.active?
  end
end
