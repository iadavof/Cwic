class Feedback < ActiveRecord::Base
	include PgSearch
	include Sspable

  # Associations
  belongs_to :user
  belongs_to :organisation

  # Attribute modifiers
  mount_uploader :screen_capture, ScreenCaptureUploader

  # Validations
  validates :specs, presence: true
  validates :user, presence: true
  validates :organisation, presence: true
  validates :screen_capture, presence: true

  # Callbacks
  before_validation :set_user
  before_validation :set_organisation

  # Scopes
  pg_global_search against: { user: 'A', organisation: 'A', message: 'B' }

  def instance_name
    "Feedback #{self.id}"
  end

private
  def set_user
    self.user = User.current
  end

  def set_organisation
    self.organisation = Organisation.current
  end
end
