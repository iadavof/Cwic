class OrganisationClient < ActiveRecord::Base
  include PgSearch
  include I18n::Alchemy

  belongs_to :organisation
  has_many :reservations, dependent: :destroy
  has_many :stickies, as: :stickable, dependent: :destroy

  validates :organisation, presence: true
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

  pg_global_search against: { first_name: 'A', last_name: 'A', email: 'A', route: 'B', street_number: 'B', locality: 'B', postal_code: 'B', country: 'B', postal_code: 'B' }, associated_against: { stickies: { sticky_text: 'C' } }

  default_scope { order(:first_name, :last_name, :locality) }

  # Search OrganisationClients for autocomplete. Finds all clients for which one of the columns matches the query. Multiple query words limit the results.
  def self.autocomplete_search(query)
    rel = query.split(' ').inject(self) do |relation, subquery|
      subquery = subquery.gsub(/[^a-zA-Z0-9]/, '') + '%' # Remove all punctuation marks from the query and add % wildcard
      relation.where('first_name ILIKE :subquery OR last_name ILIKE :subquery OR locality ILIKE :subquery', subquery: subquery)
    end.reorder(updated_at: :desc)
  end

  def instance_name
    "#{first_name} #{infix.present? ? infix + ' ' : ''} #{last_name}, #{locality}"
  end
end
