class EntityType < ActiveRecord::Base
  include PgSearch
  include Sspable
  include I18n::Alchemy

  has_many :entities, dependent: :destroy
  has_many :properties, class_name: 'EntityTypeProperty', dependent: :destroy, inverse_of: :entity_type
  has_many :options, class_name: 'EntityTypeOption', dependent: :destroy, inverse_of: :entity_type
  has_many :entity_images, as: :entity_imageable, dependent: :destroy, inverse_of: :entity_imageable
  has_many :reservation_statuses, dependent: :destroy, inverse_of: :entity_type
  has_many :info_screen_entity_types, dependent: :destroy

  belongs_to :icon, class_name: 'EntityTypeIcon'
  belongs_to :organisation

  validates :name, presence: true, length: { maximum: 255 }
  validates :reservation_statuses, presence: true

  validates :slack_before, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :slack_after, presence: true, numericality: { greater_than_or_equal_to: 0 }

  after_initialize :add_default_entity_type_reservation_statuses, if: :new_record?
  after_save :create_info_screen_entity_types
  after_save :update_reservations_slack_warnings

  accepts_nested_attributes_for :properties, allow_destroy: true
  accepts_nested_attributes_for :options, allow_destroy: true
  accepts_nested_attributes_for :entity_images, allow_destroy: true
  accepts_nested_attributes_for :reservation_statuses, allow_destroy: true

  scope :with_entities, -> { where('entities_count > 0') }

  pg_global_search against: { name: 'A', description: 'B' }

  def icon_with_default
    if self.icon_without_default.nil?
      EntityTypeIcon.first
    else
      self.icon_without_default
    end
  end
  alias_method_chain :icon, :default

  def instance_name
    self.name
  end

  def create_info_screen_entity_types
    if self.organisation.present?
      self.organisation.info_screens.each do |is|
        InfoScreenEntityType.create(entity_type: self, info_screen: is, active: is.add_new_entity_types, add_new_entities: is.add_new_entity_types)
      end
    end
  end

  def add_default_entity_type_reservation_statuses
    self.reservation_statuses.build(name: I18n.t('reservation_statuses.default.concept'), color: '#FFF849', index: 0)
    self.reservation_statuses.build(name: I18n.t('reservation_statuses.default.definitive'), color: '#FFBC49', index: 1)
    self.reservation_statuses.build(name: I18n.t('reservation_statuses.default.ready'), color: '#18C13D', index: 2)
    self.reservation_statuses.build(name: I18n.t('reservation_statuses.default.canceled'), color: '#ff3520', index: 3)
    self.reservation_statuses.build(name: I18n.t('reservation_statuses.default.not_used'), color: '#939393', index: 4)
  end

  private

  def update_reservations_slack_warnings
    if self.slack_before_changed? || self.slack_after_changed?
      self.entities.each do |entity|
        entity.update_reservations_slack_warnings(true)
      end
    end
  end
end
