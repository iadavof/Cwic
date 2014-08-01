class ReservationStatus < ActiveRecord::Base
  # Associations
  belongs_to :entity_type

  # Validations
  validates :name, presence: true, length: { maximum: 255 }
  validates :index, presence: true, numericality: { only_integer: true }
  validates :color, presence: true, length: { maximum: 255 }, color: true
  validates :entity_type, presence: true

  def instance_name
    self.name
  end
end
