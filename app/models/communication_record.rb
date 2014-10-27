class CommunicationRecord < ActiveRecord::Base
  EMOTIONS = [:angry, :sad, :blank, :happy, :superhappy]
  METHODS = [:phone, :email, :mail, :chat, :desk]

  # Associations
  belongs_to :organisation_client
  belongs_to :user
  belongs_to :reservation
  belongs_to :contact, class_name: 'OrganisationClientContact'

  # Attribute modifiers
  symbolize :emotion, in: EMOTIONS, allow_nil: true
  symbolize :method, in: METHODS, allow_nil: true

  # Validations
  validates :organisation_client, presence: true
  validates :user, presence: true
  validates :reservation_id, inclusion: { in: -> cr { cr.organisation_client.reservation_ids } }, if: -> { organisation_client.present? }, allow_nil: true
  validates :summary, presence: true

  # Callbacks
  before_validation :set_user

  # Scopes
  default_scope { order(created_at: :desc) }

  def instance_name
    "CR##{id}"
  end

  private

  def set_user
    self.user ||= User.current
  end
end
