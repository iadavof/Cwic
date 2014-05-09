class HolidayDate < ActiveRecord::Base
  belongs_to :holiday

  validates :holiday_id, presence: true
  validates :holiday, presence: true, if: "holiday_id.present?"
  validates :date, presence: true

  def instance_name
    self.date
  end
end
