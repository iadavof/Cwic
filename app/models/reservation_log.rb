class ReservationLog < ActiveRecord::Base
  # Associations
  belongs_to :user
  belongs_to :reservation

  # Validations
  validates :user, presence: true
  validates :reservation, presence: true

  # Scopes
  default_scope { order('created_at DESC') }

  def instance_name
    "#{self.class.model_name.human} #{self.id}"
  end
end
