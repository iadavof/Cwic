class InfoScreenEntity < ActiveRecord::Base
  belongs_to :info_screen_entity_type
  belongs_to :entity

  validates :direction_char, length: { maximum: 255 }
  validates :info_screen_entity_type, presence: true
  validates :entity, presence: true

  scope :active, -> { where("#{self.table_name}.active = true") }

  def instance_name
    self.direction_char
  end

  def active
    read_attribute(:active) && info_screen_entity_type.active
  end

  def available
    self.available.nil? ? entity.available : self.available
  end
end
