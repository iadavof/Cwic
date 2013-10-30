class InfoScreenEntity < ActiveRecord::Base
  belongs_to :info_screens_entity_type
  belongs_to :entity

  validates :direction_char, length: { maximum: 255 }
  validates :info_screens_entity_type, presence: true
  validates :entity, presence: true

  def instance_name
    self.direction_char
  end
end
