class OrganisationClient < ActiveRecord::Base
  include PgSearch

  belongs_to :organisation
  has_many :reservations, dependent: :destroy
  has_many :stickies, as: :stickable, dependent: :destroy

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true, length: { maximum: 255 }
  validates :route, presence: true, length: { maximum: 255 }
  validates :street_number, presence: true, length: { maximum: 255 }
  validates :locality, presence: true, length: { maximum: 255 }
  validates :administrative_area_level_2, presence: true, length: { maximum: 255 }
  validates :administrative_area_level_1, presence: true, length: { maximum: 255 }
  validates :country, presence: true, length: { maximum: 255 }
  validates :postal_code, presence: true, length: { maximum: 255 }
  validates :address_type, length: { maximum: 255 }
  validates :lng, numericality: true, allow_blank: true;
  validates :lat, numericality: true, allow_blank: true;

  multisearchable against: [ :first_name, :last_name, ]

  def instance_name
    self.first_name + ' ' + (self.infix.present? ? self.infix + ' ' : '') + self.last_name
  end
end
