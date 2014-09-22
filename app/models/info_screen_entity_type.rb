class InfoScreenEntityType < ActiveRecord::Base
  # Associations
  belongs_to :info_screen
  belongs_to :entity_type

  has_many :info_screen_entities, dependent: :destroy, inverse_of: :info_screen_entity_type
  has_many :entities, through: :info_screen_entities

  # Validations
  validates :info_screen, presence: true
  validates :entity_type, presence: true

  # Nested attributes
  accepts_nested_attributes_for :info_screen_entities

  # Scopes
  scope :active, -> { where(active: true) }

  def instance_name
    self.entity_type.instance_name
  end
end
