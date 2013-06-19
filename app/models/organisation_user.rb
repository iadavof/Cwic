class OrganisationUser < ActiveRecord::Base
  belongs_to :organisation
  belongs_to :user
  belongs_to :organisation_role

  validates :organisation, presence: true
  validates :user, presence: true, uniqueness: { scope: :organisation_id }
  validates :organisation_role, presence: true

  before_validation :set_organisation_role, on: :create

  def instance_name
    self.user.instance_name
  end

  def set_organisation_role
    # Make the new user Administrator for the new organisation (if we have not yet set the organisation role). This is useful for directly creating an organisation (with nested attributes) while registering the user through Devise. Of course this should only happen when the organisation does not already have coupled users.
    self.organisation_role = OrganisationRole.find_by_name('Administrator') if self.organisation_role.nil? && OrganisationUser.where(organisation_id: self.organisation.id).empty?
  end
end
