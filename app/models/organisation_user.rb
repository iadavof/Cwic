class OrganisationUser < ActiveRecord::Base
  belongs_to :organisation
  belongs_to :user
  belongs_to :organisation_role

  validates :organisation, presence: true
  validates :user, presence: true
  validates :organisation_role, presence: true

  before_validation :set_organisation_role, on: :create

  def instance_name
    "#{self.class.model_name.human} #{self.id}"
  end

  def set_organisation_role
    # Make the new user Administrator for the new organisation (if we have not yet set the organisation role). This is useful for directly creating an organisation (with nested attributes) while registering the user through Devise.
    self.organisation_role = OrganisationRole.find_by_name('Administrator') if self.organisation_role.nil? && OrganisationUser.where(user_id: self.user.id, organisation_id: self.organisation.id).empty?
  end
end
