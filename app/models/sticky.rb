class Sticky < ActiveRecord::Base
  # Associations
  belongs_to :stickable, polymorphic: true
  belongs_to :organisation
  belongs_to :user

  # Model extensions
  acts_as_list scope: :stickable, add_new_at: :top

  # Validations
  validates :organisation, presence: true
  validates :stickable, presence: true
  validates :user, presence: true

  # Callbacks
  before_validation :set_organisation
  before_validation :set_user

  # Scopes
  default_scope { order(:position) }

  def instance_name
    "#{self.class.model_name.human} ##{self.id}"
  end

  private

  def set_organisation
    self.organisation = stickable.organisation
  end

  def set_user
    self.user ||= User.current
  end
end
