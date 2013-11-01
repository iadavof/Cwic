class EntityType < ActiveRecord::Base
  include PgSearch
  include I18n::Alchemy

  has_many :entities, dependent: :destroy
  has_many :properties, class_name: 'EntityTypeProperty', dependent: :destroy, inverse_of: :entity_type
  has_many :options, class_name: 'EntityTypeOption', dependent: :destroy, inverse_of: :entity_type
  has_many :entity_images, as: :entity_imageable, dependent: :destroy

  belongs_to :icon, class_name: 'EntityTypeIcon'
  belongs_to :organisation

  validates :name, presence: true, length: { maximum: 255 }

  accepts_nested_attributes_for :properties, allow_destroy: true
  accepts_nested_attributes_for :options, allow_destroy: true
  accepts_nested_attributes_for :entity_images, allow_destroy: true

  scope :with_entities, -> { where('entities_count > 0') }

  multisearchable against: [ :name, :description ]

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
end
