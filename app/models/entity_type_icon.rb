class EntityTypeIcon < ActiveRecord::Base
	include PgSearch
	include Sspable

  belongs_to :organisation
  has_many :entity_types, dependent: :nullify, foreign_key: 'icon_id'

  mount_uploader :image, EntityTypeIconUploader

  validates :name, presence: true, length: { maximum: 255 }

  def instance_name
    self.name
  end
end
