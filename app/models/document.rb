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

  before_validation :set_organisation, :set_user

  def instance_name
    self.document
  end

  def set_organisation
    self.organisation = documentable.organisation
  end

  def set_user
    self.user = User.current
  end
end
