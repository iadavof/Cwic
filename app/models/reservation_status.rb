class ReservationStatus < ActiveRecord::Base
  # Associations
  belongs_to :entity_type

  # Validations
  validates :name, presence: true, length: { maximum: 255 }
  validates :color, presence: true, length: { maximum: 255 }, color: true
  validates :entity_type, presence: true

  # Callbacks
  after_destroy :reset_reservation_statuses_to_default

  def instance_name
    self.name
  end

  def reset_reservation_statuses_to_default
    entity_type.reservations.where(status: self).update_all(status_id: entity_type.default_reservation_status(memory: true).id)
  end
end
