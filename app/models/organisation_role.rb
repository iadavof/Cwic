class OrganisationRole < ActiveRecord::Base
  # Validations
  validates :name, presence: true, uniqueness: true, length: { maximum: 255 }

  def instance_name
    self.name
  end
end
