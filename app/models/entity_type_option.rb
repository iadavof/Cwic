class EntityTypeOption < ActiveRecord::Base
  belongs_to :entity_type

  validates :entity_type, presence: true
  validates :name, presence: true, length: { maximum: 50 }
  validates :description, length: { maximum: 255 }
  validates :default_price, numericality: true, allow_blank: true
  validates :index, presence: true, numericality: { only_integer: true }

  def instance_name
    self.name
  end
end
