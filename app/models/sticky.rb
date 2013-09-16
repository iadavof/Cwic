class Sticky < ActiveRecord::Base
  include I18n::Alchemy

  belongs_to :stickable, polymorphic: true
  belongs_to :user
  belongs_to :organisation

  validates :stickable, presence: true
  validates :user, presence: true
  validates :sticky_text, presence: true
  validates :weight, numericality: true, allow_nil: true

  default_scope { order('weight ASC, created_at DESC'); }

  def instance_name
    "#{self.class.model_name.human} ##{self.id.to_s}"
  end

  def json_representation
    {
      id: self.id,
      author: {id: user.id, name: user.instance_name},
      sticky_text: sticky_text,
      created_at: I18n.l(created_at),
    }
  end
end
