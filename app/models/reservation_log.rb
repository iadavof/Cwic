class ReservationLog < ActiveRecord::Base
  belongs_to :user
  belongs_to :reservation

  validates :user_id, presence: true
  validates :user, presence: true, if: "user_id.present?"
  validates :reservation_id, presence: true
  validates :reservation, presence: true, if: "reservation_id.present?"

  default_scope { order('created_at DESC') }

  def instance_name
    "#{self.class.model_name.human} #{self.id}"
  end
end
