class Organisation < ActiveRecord::Base
  include PgSearch
  include Sspable

  # Associations
  has_many :organisation_users, dependent: :destroy
  has_many :users, through: :organisation_users
  has_many :entity_types, dependent: :destroy
  has_many :entity_type_icons, dependent: :destroy
  has_many :entities, dependent: :destroy
  has_many :reservations, dependent: :destroy
  has_many :organisation_clients, dependent: :destroy
  has_many :stickies, dependent: :destroy
  has_many :entity_images, dependent: :destroy
  has_many :info_screens, dependent: :destroy
  has_many :documents, dependent: :destroy

  # Model extensions
  acts_as_tagger

  # Validations
  validates :name, presence: true, length: { maximum: 255 }
  validates :route, presence: true, length: { maximum: 255 }
  validates :street_number, presence: true, length: { maximum: 255 }
  validates :locality, presence: true, length: { maximum: 255 }
  validates :administrative_area_level_2, presence: true, length: { maximum: 255 }
  validates :administrative_area_level_1, presence: true, length: { maximum: 255 }
  validates :country, presence: true, length: { maximum: 255 }
  validates :postal_code, presence: true, length: { maximum: 255 }
  validates :address_type, length: { maximum: 255 }
  validates :lng, numericality: true, allow_blank: true
  validates :lat, numericality: true, allow_blank: true

  # Scopes
  pg_global_search against: { name: 'A', route: 'B', street_number: 'B', locality: 'B', postal_code: 'B', country: 'B', postal_code: 'B', phone_general: 'C', phone_reservations: 'C' }, associated_against: { stickies: { sticky_text: 'C' } }

  ##
  # Class methods
  ##

  def self.current
    Thread.current[:organisation]
  end

  def self.current=(organisation)
    Thread.current[:organisation] = organisation
  end

  ##
  # Instance methods
  ##

  def instance_name
    self.name
  end
end
