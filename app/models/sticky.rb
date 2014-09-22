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

  # Callbacks
  before_validation :set_organisation, :set_user

  # Scopes
  default_scope { order('weight ASC, created_at DESC'); }

  def instance_name
    "#{self.class.model_name.human} ##{self.id.to_s}"
  end

private
  def set_organisation
    self.organisation = Organisation.current
  end

  def set_user
    self.user = User.current
  end
end
