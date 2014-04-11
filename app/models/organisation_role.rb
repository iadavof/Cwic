class OrganisationRole < ActiveRecord::Base
  validates :name, presence: true, uniqueness: true, length: { maximum: 255 }

  def instance_name
    self.name
  end
end
