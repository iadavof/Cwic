class Entity < ActiveRecord::Base
  include PgSearch
  include Sspable
  include I18n::Alchemy

  has_many :properties, class_name: 'EntityProperty', dependent: :destroy, inverse_of: :entity
  has_many :reservations, dependent: :destroy
  has_many :day_occupations, dependent: :destroy
  has_many :week_occupations, dependent: :destroy
  has_many :info_screen_entities, dependent: :destroy

  has_many :stickies, as: :stickable, dependent: :destroy
  has_many :entity_images, as: :entity_imageable, dependent: :destroy

  belongs_to :entity_type, counter_cache: true
  belongs_to :organisation

  validates :entity_type_id, presence: true
  validates :entity_type, presence: true, if: "entity_type_id.present?"
  validates :organisation, presence: true
  validates :color, color: true

  validates :slack_before, numericality: { allow_blank: true, greater_than_or_equal_to: 0 }
  validates :slack_after, numericality: { allow_blank: true, greater_than_or_equal_to: 0 }

  after_initialize :set_initial_color, if: :new_record?
  after_create :create_info_screen_entities
  after_save :update_reservations_slack_warnings

  accepts_nested_attributes_for :properties, allow_destroy: true
  accepts_nested_attributes_for :entity_images, allow_destroy: true

  default_scope { order('id ASC') }

  pg_global_search against: { name: 'A', description: 'B' }, associated_against: { entity_type: { name: 'B' }, properties: { value: 'C' }, stickies: { sticky_text: 'C' } }

  def instance_name
    self.name.present? ? self.name : self.default_name
  end

  def full_instance_name
    self.entity_type.name + ': ' + self.name
  end

  def frontend_name
    read_attribute(:frontend_name) || self.instance_name
  end

  def default_name
    if self.id.present?
      self.id.to_s
    else
      ''
    end
  end

  def get_slack_before
    return read_attribute(:slack_before) if read_attribute(:slack_before).present?
    return self.entity_type.slack_before
  end

  def get_slack_after
    return read_attribute(:slack_after) if read_attribute(:slack_after).present?
    return self.entity_type.slack_after
  end

  def update_reservations_slack_warnings(force = false)
    if force || self.slack_before_changed? || self.slack_after_changed?
      self.reservations.each do |reservation|
        reservation.update_warning_state!
      end
    end
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

  def set_initial_color
    self.color = Cwic::Color.random_hex_color
  end

  def create_info_screen_entities
    self.organisation.info_screens.each do |is|
      iset = InfoScreenEntityType.where('entity_type_id = ? AND info_screen_id = ?', self.entity_type.id, is.id).first;
      InfoScreenEntity.create(entity: self, info_screen_entity_type: iset, active: iset.add_new_entities)
    end
  end
end
