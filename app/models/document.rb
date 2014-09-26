class Document < ActiveRecord::Base
  include PgSearch
  include Sspable
  include I18n::Alchemy

  # Associations
  belongs_to :documentable, polymorphic: true
  belongs_to :organisation
  belongs_to :user

  # Attribute modifiers
  mount_uploader :document, DocumentUploader

  # Validations
  validates :organisation, presence: true
  validates :documentable, presence: true
  validates :documentable_type, presence: true, length: { maximum: 255 }
  validates :user, presence: true
  validates :document, presence: true

  # Callbacks
  before_validation :set_organisation
  before_validation :set_user
  before_save :store_file_properties

  # Scopes
  pg_global_search against: { document_filename: 'A' }, associated_against: { user: { last_name: 'B', first_name: 'C' } }

  default_scope { order('id ASC') }

  def instance_name
    self.document_filename
  end

private
  def set_organisation
    self.organisation = documentable.organisation
  end

  def set_user
    self.user ||= User.current
  end

  def store_file_properties
    self.document_filename = self.document.file.filename
    self.document_size = self.document.file.size
  end
end
