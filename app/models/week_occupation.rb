class WeekOccupation < ActiveRecord::Base
  include I18n::Alchemy

  belongs_to :organisation

  validates :organisation, presence: true
  validates :week, presence: true, numericality: { only_integer: true }
  validates :year, presence: true, numericality: { only_integer: true }
  validates :occupation, presence: true, numericality: true

  def instance_name
    self.week
  end
end
