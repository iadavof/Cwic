class InfoScreen < ActiveRecord::Base
  validates :name, presence: true, length: { maximum: 255 }

  has_many :info_screen_entity_types, dependent: :destroy

  def instance_name
    self.name
  end
end
