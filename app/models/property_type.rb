class PropertyType < ActiveRecord::Base
  default_scope order(:name)

  belongs_to :entity_type
  belongs_to :data_type

  has_many :properties, dependent: :destroy

  validates :entity_type, presence: true
  validates :name, presence: true, length: { maximum: 255 }
  validates :data_type, presence: true

  after_create :create_properties

  def instance_name
    self.name
  end

  def name_with_description
    if self.description.present?
      "#{self.name} (#{self.description}"
    else
      "#{self.name}"
    end
  end

private
  def create_properties
    self.entity_type.entities.each do |entity|
      entity.properties.create(property_type: self, value: self.default_value)
    end
  end
end
