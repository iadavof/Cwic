class IntroSection < ActiveRecord::Base
  validates :title, presence: true, length: { maximum: 255 }
  validates :body, presence: true
  validates :weight, presence: true
  validates :background_color, color: true;

  mount_uploader :image, IntroSectionImageUploader

  default_scope { order('weight ASC') }

  def instance_name
    self.title
  end
end
