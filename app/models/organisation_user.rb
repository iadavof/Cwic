# There are two ways an organisation user can be added:
# 1. Directly when registering a new user/organisation. In this case we do not use the by_email system and set the organisation user directly.
# 2. By adding a new organisation user from the organisation settings panel. In this case we do use the by_email system. If the user cannot be found, then the system will respond with the invitation system.
class OrganisationUser < ActiveRecord::Base
  include PgSearch
  include Sspable

  # Associations
  belongs_to :organisation
  belongs_to :user
  belongs_to :organisation_role

  # Model extensions
  attr_accessor :by_email, :user_email # Needed to add organisation user based on their e-mail

  # Validations
  validates :organisation, presence: true
  validates :user_email, presence: true, email: { mx: true, ban_disposable_email: true }, if: :by_email
  validates :user, presence: { unless: -> { by_email } }, uniqueness: { scope: :organisation_id, allow_nil: true }
  validates :organisation_role, presence: true

  # Callbacks
  before_validation :set_user_by_email, on: :create, if: -> { self.user_email.present? }
  before_validation :set_organisation_role_first_user, on: :create, if: -> { self.organisation_role.nil? }

  # Scopes
  pg_global_search associated_against: { user: { last_name: 'A', email: 'A', first_name: 'B' } }

  def instance_name
    (self.user.present? ? self.user.instance_name : nil) # We need this fallback for the interpoliation_options when creating a new organisation user (user could then be nil).
  end

  private

  def set_user_by_email
    # Find and set the user based on their e-mail (if the e-mail is present). This is useful when adding a new user to the organisation.
    self.user = User.find_by(email: self.user_email)
  end

  def set_organisation_role_first_user
    # Make the new user Administrator for the new organisation (if we have not yet set the organisation role). This is useful for directly creating an organisation (with nested attributes) while registering the user through Devise. Of course this should only happen when the organisation does not already have coupled users.
    if OrganisationUser.where(organisation: self.organisation).empty?
      self.organisation_role = OrganisationRole.find_by(name: 'Administrator')
    end
  end
end
