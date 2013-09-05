class Sticky < ActiveRecord::Base
  include I18n::Alchemy

  belongs_to :stickable, polymorphic: true
  belongs_to :user

  validates :stickable, presence: true
  validates :user, presence: true
  validates :sticky_text, presence: true
  validates :pos_x, presence: true, numericality: true
  validates :pos_y, presence: true, numericality: true
  validates :width, presence: true, numericality: true
  validates :height, presence: true, numericality: true

  def instance_name
    self.id
  end
end
