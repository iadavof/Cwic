class Reservation < ActiveRecord::Base
  belongs_to :organisation_client
  belongs_to :entity
  belongs_to :organisation

  validates :begins_at, presence: true
  validates :ends_at, presence: true
  validates :entity, presence: true
  validates :organisation_client, presence: true

  def instance_name
    self.begins_at
  end
end
