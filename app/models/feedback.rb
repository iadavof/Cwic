class Feedback < ActiveRecord::Base

  belongs_to :user
  belongs_to :organisation

  validates :message, presence: true
  validates :specs, presence: true
  validates :user, presence: true
  validates :screen_capture, presence: true

  mount_uploader :screen_capture, ScreencapUploader

  def instance_name
    'Feedback #' + self.id.to_s
  end
end
