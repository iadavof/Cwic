class Document < ActiveRecord::Base
  # Associations
  belongs_to :documentable, polymorphic: true
  belongs_to :organisation
  belongs_to :user

  mount_uploader :document, DocumentUploader

  # Validations
  validates :organisation_id, presence: true
  validates :organisation, presence: true, if: "organisation_id.present?"
  validates :documentable, presence: true
  validates :documentable_type, presence: true, length: { maximum: 255 }
  validates :user_id, presence: true
  validates :user, presence: true, if: "user_id.present?"
  validates :document, presence: true

  def instance_name
    self.document
  end
end
