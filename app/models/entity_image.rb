class EntityImage < ActiveRecord::Base
  belongs_to :entity_imageable, polymorphic: true
  belongs_to :organisation

  mount_uploader :image, EntityImageUploader

  validates :title, length: { maximum: 255 }
  validates :entity_imageable, presence: true
  validates :entity_imageable_type, presence: true, length: { maximum: 255 }
  validates :organisation_id, presence: true
  validates :organisation, presence: true, if: "organisation_id.present?"
  validates :image, presence: true

  before_validation :set_organisation

  def instance_name
    self.title
  end

private
  def set_organisation
    self.organisation = self.entity_imageable.organisation
  end
end
