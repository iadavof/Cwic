class Frontend < ActiveRecord::Base
  include PgSearch
  include Sspable

  # Associations
  belongs_to :organisation

  has_many :frontend_entity_types, dependent: :destroy, inverse_of: :frontend
  has_many :frontend_entities, dependent: :destroy, through: :frontend_entity_types
  has_many :entity_types, through: :frontend_entity_types
  has_many :entities, through: :frontend_entities

  # Model extensions
  obfuscate_id spin: 17973532

  # Validations
  validates :name, presence: true, length: { maximum: 255 }

  # Callbacks
  after_initialize :init, if: :new_record?

  # Nested attributes
  accepts_nested_attributes_for :frontend_entity_types

  def init
    initialize_entity_types_and_entities if frontend_entity_types.empty?
  end

  def instance_name
    self.name
  end

  private

  # Initialize frontend with all the Entity Types and Entities for the organisation.
  def initialize_entity_types_and_entities
    self.frontend_entity_types << self.organisation.entity_types.includes(:entities).map do |et|
      iset = FrontendEntityType.new(entity_type: et)
      iset.frontend_entities << et.entities.map { |e| FrontendEntity.new(entity: e) }
      iset
    end
  end
end
