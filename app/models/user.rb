class User < ActiveRecord::Base
  include PgSearch
  include Sspable

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :invitable, :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :organisation_users, inverse_of: :user, dependent: :destroy
  has_many :organisations, through: :organisation_users
  has_many :invitations, class_name: 'User', as: :invited_by

  accepts_nested_attributes_for :organisations
  accepts_nested_attributes_for :organisation_users

  validates :first_name, presence: true, length: { maximum: 255 }
  validates :last_name, presence: true, length: { maximum: 255 }
  validates :infix, length: { maximum: 255 }

  pg_global_search against: { last_name: 'A', email: 'A', first_name: 'B' }


  def instance_name
    self.first_name + ' ' + (self.infix.present? ? self.infix + ' ' : '') + self.last_name
  end

  def get_status
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
end
