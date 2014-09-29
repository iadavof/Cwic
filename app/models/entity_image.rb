class EntityImage < ActiveRecord::Base
  # Associations
  belongs_to :imageable, polymorphic: true
  belongs_to :organisation

  # Attribute modifiers
  mount_uploader :image, EntityImageUploader

  # Validations
  validates :title, length: { maximum: 255 }
  validates :imageable, presence: true
  validates :imageable_type, presence: true, length: { maximum: 255 }
  validates :organisation, presence: true
  validates :image, presence: true

  # Callbacks
  before_validation :set_organisation

  def instance_name
    self.title
  end

  private

  def set_organisation
    self.organisation = self.imageable.organisation
  end
end
