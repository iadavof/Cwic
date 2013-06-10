class OrganisationUser < ActiveRecord::Base
  belongs_to :organisation
  belongs_to :user
  belongs_to :organisation_role

  validates :organisation, presence: true
  validates :user, presence: true
  validates :organisation_role, presence: true

  def instance_name
    "#{self.class.model_name.human} #{self.id}"
  end
end
