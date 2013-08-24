class FeedbackAndScreencap < ActiveRecord::Base
  validates :message, presence: true
  validates :screencap, presence: true
end
