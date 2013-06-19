class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :organisation_users, dependent: :destroy
  has_many :organisations, through: :organisation_users

  accepts_nested_attributes_for :organisations

  validates :first_name, presence: true, length: { maximum: 255 }
  validates :last_name, presence: true, length: { maximum: 255 }
  validates :infix, length: { maximum: 255 }

  def instance_name
    self.first_name + (self.infix.present? ? self.infix : '') + self.last_name
  end
end
