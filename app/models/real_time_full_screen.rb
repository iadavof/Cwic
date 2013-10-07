class RealTimeFullScreen < ActiveRecord::Base
  validates :name, presence: true, length: { maximum: 255 }
  validates :public, presence: true

  def instance_name
    self.name
  end
end
