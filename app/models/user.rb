class User < ActiveRecord::Base
  include PgSearch
  include Sspable

  # Model extensions
  devise :invitable, :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable

  # Associations
  has_many :organisation_users, inverse_of: :user, dependent: :destroy
  has_many :organisations, through: :organisation_users
  has_many :invitations, class_name: 'User', as: :invited_by

  # Model extensions
  # For actions that require the users password (such as updating the password or the e-mail)
  attr_accessor :current_password
  attr_accessor :validate_current_password

  # Validations
  validates :first_name, presence: true, length: { maximum: 255 }
  validates :last_name, presence: true, length: { maximum: 255 }
  validates :infix, length: { maximum: 255 }
  validates :email, email: true
  validate :current_password_validator, if: :validate_current_password

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
      return :active
    else
      return :awaiting_invitation_acceptance
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

  private

  def current_password_validator
    errors[:current_password] << I18n.t('errors.messages.invalid') unless User.current.valid_password?(current_password)
  end
end
