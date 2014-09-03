class CommunicationRecord < ActiveRecord::Base
  # Associations
  belongs_to :organisation_client
  belongs_to :user
  belongs_to :reservation
  belongs_to :contact, class_name: 'OrganisationClientContact'

  # Validations
  validates :organisation_client, presence: true
  validates :user, presence: true
  validates :summary, presence: true
  validates :emotion, length: { maximum: 255 }
  validates :method, length: { maximum: 255 }

  # Callbacks
  before_validation :set_current_user

  # Scopes
  default_scope { order(created_at: :desc) }

  ##
  # Class methods
  ##

  def self.possible_emotions
    [:angry, :sad, :blank, :happy, :superhappy]
  end

  def self.possible_methods
    [:phone, :email, :mail, :chat, :desk]
  end

  ##
  # Instance methods
  ##

  def instance_name
    self.summary
  end

  def set_current_user
    self.user = User.current
  end
end
