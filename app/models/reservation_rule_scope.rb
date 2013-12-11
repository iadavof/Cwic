class ReservationRuleScope < ActiveRecord::Base
  include I18n::Alchemy

  belongs_to :entity
  belongs_to :repetition_unit, class_name: 'TimeUnit'
  has_many :spans, class_name: 'ReservationRuleScopeSpan', dependent: :destroy, inverse_of: :scope, foreign_key: 'scope_id'

  validates :entity_id, presence: true
  validates :entity, presence: true, if: "entity_id.present?"
  validates :name, presence: true, length: { maximum: 255 }
  validates :repetition_unit_id, presence: true
  validates :repetition_unit, presence: true, if: "repetition_unit_id.present?"

  has_ancestry

  accepts_nested_attributes_for :spans, allow_destroy: true

  # Keys of available repetition units to choose from when adding a root level scope.
  # These should be listed in decreasing order of size (time span).
  AVAILABLE_REPETITION_UNIT_KEYS = ['infinite', 'year', 'month', 'week', 'day']

  # Gives the keys of the valid repetition units for this scope. These are the available repetition units that are 'smaller' than the repetition unit of the parent.
  def valid_repetition_unit_keys
    keys = AVAILABLE_REPETITION_UNIT_KEYS
    if parent.present?
      keys.drop(keys.index(parent.repetition_unit.key) + 1) # Drop period units up to the parent key
    else
      keys # Return all available period units
    end
  end

  def can_have_childs?
    valid_repetition_unit_keys.many? # This scope can have childs if there are at least two valid repetition units for it (one is taken by this scope it self, the other is available for the child)
  end

  def valid_repetition_units
    TimeUnit.where(key: valid_repetition_unit_keys).reorder(seconds: :desc)
  end

  def instance_name
    self.name
  end
end
