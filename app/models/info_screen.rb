class InfoScreen < ActiveRecord::Base
  include PgSearch
  include Sspable

  # Associations
  belongs_to :organisation

  has_many :info_screen_entity_types, dependent: :destroy, inverse_of: :info_screen
  has_many :info_screen_entities, dependent: :destroy, through: :info_screen_entity_types
  has_many :entity_types, through: :info_screen_entity_types
  has_many :entities, through: :info_screen_entities

  # Validations
  validates :name, presence: true, length: { maximum: 255 }

  # Callbacks
  after_initialize :init, if: :new_record?
  after_save :trigger_update_infoscreens, if: -> { Object.const_defined?('WebsocketRails') }

  # Nested attributes
  accepts_nested_attributes_for :info_screen_entity_types

  def init
    initialize_entity_types_and_entities if info_screen_entity_types.empty?
  end

  def instance_name
    self.name
  end

  private

  # Initialize info screen with all the Entity Types and Entities for the organisation.
  def initialize_entity_types_and_entities
    self.info_screen_entity_types << self.organisation.entity_types.includes(:entities).map do |et|
      iset = InfoScreenEntityType.new(entity_type: et)
      iset.info_screen_entities << et.entities.map { |e| InfoScreenEntity.new(entity: e) }
      iset
    end
  end

  def trigger_update_infoscreens
    WebsocketRails["infoscreens_#{organisation.id}"].trigger('update')
  end
end
