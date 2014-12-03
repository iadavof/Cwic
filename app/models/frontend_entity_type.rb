class FrontendEntityType < ActiveRecord::Base
  # Associations
  belongs_to :frontend
  belongs_to :entity_type

  has_many :frontend_entities, dependent: :destroy, inverse_of: :frontend_entity_type
  has_many :entities, through: :frontend_entities

  # Validations
  validates :frontend, presence: true
  validates :entity_type, presence: true

  # Nested attributes
  accepts_nested_attributes_for :frontend_entities

  # Scopes
  scope :active, -> { where(active: true) }

  def instance_name
    self.entity_type.instance_name
  end
end
