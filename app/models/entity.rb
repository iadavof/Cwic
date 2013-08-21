class Entity < ActiveRecord::Base
  belongs_to :entity_type, counter_cache: true
  belongs_to :organisation
  has_many :entity_properties, dependent: :destroy, inverse_of: :entity

  validates :name, presence: true, length: { maximum: 255 }
  validates :entity_type, presence: true
  validates :organisation, presence: true
  validates :color, color: true

  accepts_nested_attributes_for :entity_properties, allow_destroy: true

  default_scope order('id ASC')

  def instance_name
    self.name
  end
end
