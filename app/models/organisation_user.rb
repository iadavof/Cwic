class OrganisationUser < ActiveRecord::Base
  include PgSearch
  include Sspable

  # There are two ways an organisation user can be added:
  # 1. Directly when registering a new user/organisation. In this case we do not use the by_email system and set the organisation user directly.
  # 2. By adding a new organisation user from the organisation settings panel. In this case we do use the by_email system. If the user cannot be found, then the system will respond with the invitation system.

  belongs_to :organisation
  belongs_to :user
  belongs_to :organisation_role

  validates :organisation, presence: true
  validates :user_email, presence: true, format: { with: Devise::email_regexp, allow_blank: true }, if: :by_email
  validates :user, presence: { unless: "by_email" }, uniqueness: { scope: :organisation_id, allow_nil: true }
  validates :organisation_role, presence: true

  before_validation :set_user, :set_organisation_role, on: :create

  pg_global_search associated_against: { user: { last_name: 'A', email: 'A', first_name: 'B' } }

  attr_accessor :by_email, :user_email # Needed to add organisation user based on their e-mail

  def instance_name
    (self.user.present? ? self.user.instance_name : nil) # We need this fallback for the interpoliation_options when creating a new organisation user (user could then be nil).
  end

  def set_user
    # Find and set the user based on their e-mail (if the e-mail is present). This is useful when adding a new user to the organisation.
    self.user = User.where(email: self.user_email).first if self.user_email.present?
  end

  def set_organisation_role
    # Make the new user Administrator for the new organisation (if we have not yet set the organisation role). This is useful for directly creating an organisation (with nested attributes) while registering the user through Devise. Of course this should only happen when the organisation does not already have coupled users.
    self.organisation_role = OrganisationRole.where(name: 'Administrator').first if self.organisation_role.nil? && OrganisationUser.where(organisation_id: self.organisation.id).empty?
  end
end
