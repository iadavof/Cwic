class Feedback < ActiveRecord::Base

	include PgSearch
	include Sspable

  belongs_to :user
  belongs_to :organisation

  validates :specs, presence: true
  validates :user, presence: true
  validates :screen_capture, presence: true

  mount_uploader :screen_capture, ScreencapUploader

  pg_global_search against: { user: 'A', organisation: 'A', message: 'B' }

  def instance_name
    'Feedback #' + self.id.to_s
  end
end
