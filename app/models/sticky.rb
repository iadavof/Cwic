class Sticky < ActiveRecord::Base
  # Associations
  belongs_to :stickable, polymorphic: true
  belongs_to :user
  belongs_to :organisation

  # Validations
  validates :organisation, presence: true
  validates :stickable, presence: true
  validates :user, presence: true
  validates :weight, numericality: true, allow_nil: true

  # Scopes
  default_scope { order('weight ASC, created_at DESC'); }

  def instance_name
    "#{self.class.model_name.human} ##{self.id.to_s}"
  end
end
