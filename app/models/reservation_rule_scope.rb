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

  # Gives the valid repetition units for this scope. These are the base repetition units that are 'smaller' than the repetition unit of the parent.
  def valid_repetition_units
    base_units = ['infinite', 'year', 'month', 'week', 'day']
    relation = TimeUnit.where(key: base_units)
    relation = relation.where('seconds < ?', parent.repetition_unit.seconds) if parent.present?
    relation.reorder('seconds DESC')
  end

  def instance_name
    self.name
  end
end
