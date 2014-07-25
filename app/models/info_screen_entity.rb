class InfoScreenEntity < ActiveRecord::Base
  # Associations
  belongs_to :info_screen_entity_type
  belongs_to :entity

  # Validations
  validates :direction_char, length: { maximum: 255 }
  validates :info_screen_entity_type, presence: true
  validates :entity, presence: true

  # Scopes
  scope :active, -> { where("#{self.table_name}.active = true") }

  def instance_name
    self.entity.instance_name
  end

  def active?
    read_attribute(:active) && info_screen_entity_type.active?
  end
end
