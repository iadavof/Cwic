class InfoScreenEntityType < ActiveRecord::Base
  belongs_to :info_screen
  belongs_to :entity_type

  has_many :info_screen_entities, dependent: :destroy

  validates :add_new_entities
  validates :info_screen, presence: true
  validates :entity_type, presence: true

  def instance_name
    self.add_new_entities
  end
end
