class PropertyType < ActiveRecord::Base
  belongs_to :entity_type
  belongs_to :data_type

  validates :entity_type, presence: true
  validates :name, presence: true, length: { maximum: 255 }
  validates :data_type, presence: true

  def instance_name
    self.name
  end
end
