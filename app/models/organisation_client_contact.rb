class OrganisationClientContact < ActiveRecord::Base
  # Associations
  belongs_to :organisation_client

  # Attribute modifiers
  normalize_attributes :first_name, :infix, :last_name, :email, :position, :route, :street_number, :postal_code, :locality, :country, :administrative_area_level_2, :administrative_area_level_1, :phone, :mobile_phone

  # Validations
  validates :organisation_client_id, presence: true
  validates :organisation_client, presence: true, if: "organisation_client_id.present?"
  validates :first_name, presence: true, length: { maximum: 255 }
  validates :infix, length: { maximum: 255 }
  validates :last_name, presence: true, length: { maximum: 255 }
  validates :email, length: { maximum: 255 }
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
    "#{last_name}, #{first_name}#{infix.present? ? (' ' + infix) : ''}"
  end

  def municipality
    "#{administrative_area_level_2}#{administrative_area_level_1.present? ? (', ' + administrative_area_level_1) : ''}"
  end

  def vcard
    Vcard::Vcard::Maker.make2 do |maker|

      # Setting up name
      maker.add_name do |name|
        name.prefix = infix  if infix.present?
        name.given = first_name
        name.family = last_name
      end

      # Setting up address.
      maker.add_addr do |addr|
        addr.street = route + ' ' +  street_number
        addr.postalcode = postal_code
        addr.locality = locality
        addr.region = municipality
        addr.country = country
      end

      maker.org = organisation_client.instance_name
      maker.title = position
      maker.add_tel(phone) { |e| e.location = 'work'}  if phone.present?
      maker.add_tel(mobile_phone) { |e| e.location = 'cell'}  if mobile_phone.present?

      maker.add_note(note)  if note.present?

      maker.add_email(email) { |e| e.location = 'work' } if email.present?
    end
  end
end
