class ReservationStatus < ActiveRecord::Base
  # Associations
  belongs_to :entity_type

  # Model extensions
  acts_as_list scope: :entity_type

  # Validations
  validates :entity_type, presence: true
  validates :name, presence: true, length: { maximum: 255 }
  validates :color, presence: true, length: { maximum: 255 }, color: { allow_blank: true }
  validate :ensure_exactly_one_default_status

  # Callbacks
  before_validation :make_only_default_status, if: :default_status?

  before_destroy :prevent_destroy, if: :default_status?
  after_destroy :reset_reservation_statuses_to_default

  # Scopes
  default_scope { order(:position) }

  def instance_name
    name
  end

  private

  def ensure_exactly_one_default_status
    # Load all statuses
    statuses = entity_type.reservation_statuses
    # Replace outdated status self from set with actual self, however, this is only possible if self is saved (i.e. has an id)
    statuses = statuses.where.not(id: self).push(self) if id.present?
    # Count the default statuses
    count = statuses.select(&:default_status?).count
    if count > 1
      errors.add(:base, I18n.t('activerecord.errors.models.reservation_status.multiple_default_statuses'))
    elsif count < 1
      errors.add(:base, I18n.t('activerecord.errors.models.reservation_status.no_default_status'))
    end
  end

  def make_only_default_status
    # This reservation status is selected as the default status.
    # Make sure it is the only default status by setting default_status to false for all others.
    entity_type.reservation_statuses.where.not(id: self).update_all(default_status: false)
  end

  def prevent_destroy
    errors.add(:base, :no_default_status)
    false
  end

  def reset_reservation_statuses_to_default
    entity_type.reservations.where(status: self).update_all(status_id: entity_type.default_reservation_status(memory: true).id)
  end
end
