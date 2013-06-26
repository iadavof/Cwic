class User < ActiveRecord::Base
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
end
