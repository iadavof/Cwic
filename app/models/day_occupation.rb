class DayOccupation < ActiveRecord::Base
  include I18n::Alchemy

  belongs_to :entity

  validates :entity, presence: true
  validates :day, presence: true
  validates :occupation, presence: true, numericality: true

  def instance_name
    self.day
  end
end
