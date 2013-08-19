class EntityTypeIcon < ActiveRecord::Base
  belongs_to :organisation
  has_many :entity_types, dependent: :nullify

  mount_uploader :image, EntityTypeIconUploader

  validates :name, presence: true, length: { maximum: 255 }

  def instance_name
    self.name
  end
end
