class Entity < ActiveRecord::Base
  has_many :properties, class_name: 'EntityProperty', dependent: :destroy, inverse_of: :entity
  has_many :reservation_rules, dependent: :destroy, inverse_of: :entity
  has_many :reservations, dependent: :destroy
  has_many :day_occupations, dependent: :destroy
  has_many :week_occupations, dependent: :destroy

  belongs_to :entity_type, counter_cache: true
  belongs_to :organisation

  validates :name, presence: true, length: { maximum: 255 }
  validates :entity_type, presence: true
  validates :organisation, presence: true
  validates :color, color: true

  accepts_nested_attributes_for :properties, allow_destroy: true
  accepts_nested_attributes_for :reservation_rules, allow_destroy: true

  default_scope order('id ASC')

  def instance_name
    self.name
  end

  def text_color
    Cwic::Color.text_color(self.color)
  end
end
