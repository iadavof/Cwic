class Entity < ActiveRecord::Base
  belongs_to :entity_type
  belongs_to :organisation
  has_many :properties, dependent: :destroy, inverse_of: :entity

  validates :name, presence: true, length: { maximum: 255 }
  validates :entity_type, presence: true
  validates :organisation, presence: true

  accepts_nested_attributes_for :properties, allow_destroy: true

  def instance_name
    self.name
  end
end
