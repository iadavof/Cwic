class Entity < ActiveRecord::Base
  include PgSearch
  include I18n::Alchemy

  has_many :properties, class_name: 'EntityProperty', dependent: :destroy, inverse_of: :entity
  has_many :reservation_rule_scopes, dependent: :destroy, inverse_of: :entity
  has_many :reservations, dependent: :destroy
  has_many :day_occupations, dependent: :destroy
  has_many :week_occupations, dependent: :destroy
  has_many :info_screen_entities, dependent: :destroy

  has_many :stickies, as: :stickable, dependent: :destroy
  has_many :entity_images, as: :entity_imageable, dependent: :destroy

  belongs_to :entity_type, counter_cache: true
  belongs_to :organisation

  validates :name, presence: true, length: { maximum: 255 }
  validates :entity_type_id, presence: true
  validates :entity_type, presence: true, if: "entity_type_id.present?"
  validates :organisation, presence: true
  validates :color, color: true

  after_create :create_info_screen_entities

  accepts_nested_attributes_for :properties, allow_destroy: true
  accepts_nested_attributes_for :reservation_rule_scopes, allow_destroy: true
  accepts_nested_attributes_for :entity_images, allow_destroy: true

  default_scope { order('id ASC') }

  pg_global_search against: { name: 'A', description: 'B' }, associated_against: { entity_type: { name: 'B' }, properties: { value: 'C' }, stickies: { sticky_text: 'C' } }

  def instance_name
    self.name
  end

  def all_entity_images
    if include_entity_type_images
      entity_images + entity_type.entity_images
    else
      entity_images
    end
  end

  def text_color
    Cwic::Color.text_color(self.color)
  end

  def create_info_screen_entities
    self.organisation.info_screens.each do |is|
      iset = InfoScreenEntityType.where('entity_type_id = ? AND info_screen_id = ?', self.entity_type.id, is.id).first;
      InfoScreenEntity.create(entity: self, info_screen_entity_type: iset, active: iset.add_new_entities)
    end
  end
end
