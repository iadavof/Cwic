class InfoScreen < ActiveRecord::Base
  belongs_to :organisation

  has_many :info_screen_entity_types, dependent: :destroy, inverse_of: :info_screen
  has_many :info_screen_entities, dependent: :destroy, through: :info_screen_entity_types

  validates :name, presence: true, length: { maximum: 255 }

  accepts_nested_attributes_for :info_screen_entity_types

  def instance_name
    self.name
  end

  # Initialize info screen with all the Entity Types and Entities for the organisation.
  def initialize_entity_types_and_entities
    self.info_screen_entity_types << self.organisation.entity_types.includes(:entities).map do |et|
      iset = InfoScreenEntityType.new(entity_type: et)
      iset.info_screen_entities << et.entities.map { |e| InfoScreenEntity.new(entity: e) }
      iset
    end
  end
end
