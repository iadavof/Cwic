class InfoScreenEntityType < ActiveRecord::Base
  belongs_to :info_screen
  belongs_to :entity_type

  has_many :info_screen_entities, dependent: :destroy, inverse_of: :info_screen_entity_type
  has_many :entities, through: :info_screen_entities

  validates :info_screen, presence: true
  validates :entity_type, presence: true

  accepts_nested_attributes_for :info_screen_entities

  scope :active, -> { where('active = true') }

  def instance_name
    self.entity_type.instance_name
  end
end
