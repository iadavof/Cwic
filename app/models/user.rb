class User < ActiveRecord::Base
  include PgSearch
  include Sspable

  # Devise setup
  devise :invitable, :database_authenticatable, :registerable, :confirmable, :recoverable, :rememberable, :trackable, :validatable

  # Associations
  has_many :organisation_users, inverse_of: :user, dependent: :destroy
  has_many :organisations, through: :organisation_users
  has_many :invitations, class_name: 'User', as: :invited_by

  # Validations
  validates :first_name, presence: true, length: { maximum: 255 }
  validates :last_name, presence: true, length: { maximum: 255 }
  validates :infix, length: { maximum: 255 }
  validates :email, email: true

  # Nested attributes
  accepts_nested_attributes_for :organisations
  accepts_nested_attributes_for :organisation_users

  # Scopes
  pg_global_search against: { last_name: 'A', email: 'A', first_name: 'B' }

  # Class methods

  def self.current
    Thread.current[:user]
  end

  def self.current=(user)
    Thread.current[:user] = user
  end

  # Instance methods

  def instance_name
    "#{first_name}#{infix.present? ? (' ' + infix) : ''} #{last_name}"
  end

  def status
    if accepted_or_not_invited?
      :active
    else
      :awaiting_invitation_acceptance
    end
  end

  # Overwrite Devise resend_confirmation_token method to deal with invitations.
  def resend_confirmation_token
    if accepted_or_not_invited?
      # User was not invited or has already accepted (in the latter case we are probably dealing with a reconfirmation e-mail), simply resend confirmation e-mail:
      super
    else
      # User was invited. Do not (re)send confirmation e-mail, but resend invitation e-mail instead:
      self.invite!
    end
  end

  def email=(value)
    # Reset unconfirmed email if we change the email back to the old, already confirmed email.
    self.unconfirmed_email = nil if email == value
    super
  end
end
