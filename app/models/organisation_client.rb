class OrganisationClient < ActiveRecord::Base
  include PgSearch
  include Sspable
  include Taggable

  # Associations
  belongs_to :organisation
  has_many :reservations, dependent: :destroy
  has_many :organisation_client_contacts, dependent: :destroy
  has_many :stickies, as: :stickable, dependent: :destroy
  has_many :documents, as: :documentable, dependent: :destroy, inverse_of: :documentable

  # Validations
  validates :organisation, presence: true
  validates :first_name, presence: true, unless: 'self.business_client'
  validates :last_name, presence: true, unless: 'self.business_client'
  validates :company_name, presence: true, if: 'self.business_client'
  validates :email, presence: true, length: { maximum: 255 }
  validates :route, presence: true, length: { maximum: 255 }
  validates :street_number, presence: true, length: { maximum: 255 }
  validates :locality, presence: true, length: { maximum: 255 }
  validates :administrative_area_level_2, presence: true, length: { maximum: 255 }
  validates :administrative_area_level_1, presence: true, length: { maximum: 255 }
  validates :country, presence: true, length: { maximum: 255 }
  validates :postal_code, presence: true, length: { maximum: 255 }
  validates :iban_att, presence: true, if: 'self.iban.present?'
  validate :iban_valid

  # Nested attributes
  accepts_nested_attributes_for :documents, allow_destroy: true, reject_if: :all_blank

  # Scopes
  pg_global_search against: { first_name: 'A', infix: 'C', last_name: 'A', email: 'A', route: 'B', street_number: 'B', locality: 'B', postal_code: 'B', country: 'B', postal_code: 'B', phone: 'C', mobile_phone: 'C' }, associated_against: { stickies: { sticky_text: 'C' } }

  default_scope { order(:last_name, :first_name, :locality) }

  ##
  # Class methods
  ##

  # Search OrganisationClients for autocomplete. Finds all clients for which one of the columns matches the query. Multiple query words limit the results.
  def self.autocomplete_search(query)
    # PERFORMANCE: use indexes to improve performance
    query.split(' ').inject(self) do |relation, subquery|
      subquery = subquery.gsub(/[^a-zA-Z0-9]/, '') + '%' # Remove all punctuation marks from the query and add % wildcard
      relation.where('first_name ILIKE :subquery OR last_name ILIKE :subquery OR locality ILIKE :subquery', subquery: subquery)
    end.reorder(updated_at: :desc)
  end

  ##
  # Instance methods
  ##

  def instance_name
    if self.business_client
      "#{company_name}, #{locality}"
    else
      "#{full_name}, #{locality}"
    end
  end

  def full_name
    "#{last_name}, #{first_name} #{infix.present? ? infix + ' ' : ''}"
  end

  def upcoming_reservations(limit)
    rel = self.reservations.where('ends_at >= :now', now: Time.now).order(:ends_at)
    rel = rel.limit(limit) if limit.present?
    rel
  end

  def past_reservations(limit)
    rel = self.reservations.where('begins_at <= :now AND ends_at <= :now', now: Time.now).order(ends_at: :desc)
    rel = rel.limit(limit) if limit.present?
    rel
  end

  def iban_valid

    # We do not require the iban to be present
    return true if self.iban == ''

    iban_model = IBANTools::IBAN.new(self.iban)
    iban_errors = iban_model.validation_errors
    if iban_errors.present?
      iban_errors.each do |e|
        errors.add(:iban, e)
      end
      false
    else
      self.iban = iban_model.prettify
      true
    end
  end
end
