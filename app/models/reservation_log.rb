class ReservationLog < ActiveRecord::Base
  # Associations
  belongs_to :user
  belongs_to :reservation

  # Validations
  validates :user_id, presence: true
  validates :user, presence: true, if: -> { user_id.present? }
  validates :reservation_id, presence: true
  validates :reservation, presence: true, if: -> { reservation_id.present? }

  # Scopes
  default_scope { order('created_at DESC') }

  def instance_name
    "#{self.class.model_name.human} #{self.id}"
  end
end
