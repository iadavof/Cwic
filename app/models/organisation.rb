class Organisation < ActiveRecord::Base
  has_many :organisation_users, dependent: :destroy
  has_many :users, through: :organisation_users
  has_many :entity_types, dependent: :destroy
  has_many :entity_type_icons, dependent: :destroy
  has_many :entities, dependent: :destroy
  has_many :reservations, dependent: :destroy
  has_many :organisation_clients, dependent: :destroy
  has_many :stickies, dependent: :destroy
  has_many :entity_images, dependent: :destroy

  has_many :day_occupations, dependent: :destroy
  has_many :week_occupations, dependent: :destroy

  validates :name, presence: true, length: { maximum: 255 }
  validates :route, presence: true, length: { maximum: 255 }
  validates :street_number, presence: true, length: { maximum: 255 }
  validates :locality, presence: true, length: { maximum: 255 }
  validates :administrative_area_level_2, presence: true, length: { maximum: 255 }
  validates :administrative_area_level_1, presence: true, length: { maximum: 255 }
  validates :country, presence: true, length: { maximum: 255 }
  validates :postal_code, presence: true, length: { maximum: 255 }
  validates :address_type, length: { maximum: 255 }
  validates :lng, numericality: true
  validates :lat, numericality: true

  def instance_name
    self.name
  end
end