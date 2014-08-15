class OrganisationClientContact < ActiveRecord::Base
  # Associations
  belongs_to :organisation_client

  # Validations
  validates :organisation_client_id, presence: true
  validates :organisation_client, presence: true, if: "organisation_client_id.present?"
  validates :first_name, presence: true, length: { maximum: 255 }
  validates :infix, length: { maximum: 255 }
  validates :last_name, presence: true, length: { maximum: 255 }
  validates :position, length: { maximum: 255 }
  validates :route, length: { maximum: 255 }
  validates :street_number, length: { maximum: 255 }
  validates :postal_code, length: { maximum: 255 }
  validates :locality, length: { maximum: 255 }
  validates :country, length: { maximum: 255 }
  validates :administrative_area_level_2, length: { maximum: 255 }
  validates :administrative_area_level_1, length: { maximum: 255 }
  validates :phone, length: { maximum: 255 }
  validates :mobile_phone, length: { maximum: 255 }

  default_scope { order(:last_name, :first_name, :position) }

  def instance_name
    self.full_name
  end

  def full_name
    "#{last_name}, #{first_name} #{infix.present? ? ' ' + infix : ''}"
  end
end
