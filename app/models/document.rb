class Document < ActiveRecord::Base
  include PgSearch
  include Sspable

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
  before_save :store_file_properties

  pg_global_search associated_against: { user: { last_name: 'A', first_name: 'B' } }

  default_scope { order('id ASC') }

  def instance_name
    self.document_filename
  end

  def set_organisation
    self.organisation = documentable.organisation
  end

  def store_file_properties
    self.document_filename = self.document.file.filename
    self.document_size = self.document.file.size
  end

  def set_user
    self.user = User.current
  end
end
