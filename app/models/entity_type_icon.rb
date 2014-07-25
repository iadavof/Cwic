class EntityTypeIcon < ActiveRecord::Base
	include PgSearch
	include Sspable

  # Associations
  belongs_to :organisation
  has_many :entity_types, dependent: :nullify, foreign_key: 'icon_id'

  # Attribute modifiers
  mount_uploader :image, EntityTypeIconUploader

  # Validations
  validates :name, presence: true, uniqueness: true, length: { maximum: 255 }

  # Scopes
  pg_global_search against: { name: 'A' }

  def instance_name
    self.name
  end
end
