class InfoScreen < ActiveRecord::Base
  validates :name, presence: true, length: { maximum: 255 }

  def instance_name
    self.name
  end
end
