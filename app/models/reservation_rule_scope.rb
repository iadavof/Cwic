class ValidSpanTypeValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    record.errors.add(attribute, :invalid) unless record.class::SPAN_TYPES[record.repetition_unit.key].include?(value)
  end
end

class ReservationRuleScope < ActiveRecord::Base
  include I18n::Alchemy

  # Keys of available repetition units to choose from when adding a root level scope.
  # These should be listed in decreasing order of size (time span).
  REPETITION_UNITS = [:infinite, :year, :month, :week, :day]
  SPAN_TYPES = {
    year: [:dates, :weeks, :holidays],
    month: [:days, :nr_dow_of]
  }

  belongs_to :scopeable, polymorphic: true
  belongs_to :repetition_unit, class_name: 'TimeUnit'
  has_many :spans, class_name: 'ReservationRuleScopeSpan', dependent: :destroy, inverse_of: :scope, foreign_key: 'scope_id'
  has_many :rules, class_name: 'ReservationRule', dependent: :destroy, inverse_of: :scope, foreign_key: 'scope_id'

  symbolize :span_type

  validates :scopeable_id, presence: true
  validates :scopeable, presence: true, if: -> { scopeable_id.present? }
  validates :name, presence: true, length: { maximum: 255 }
  validates :repetition_unit_id, presence: true
  validates :repetition_unit, presence: true, if: -> { repetition_unit_id.present? }
  validates :span_type, presence: true, valid_span_type: { allow_blank: true }, if: -> { self.repetition_unit.present? && SPAN_TYPES[self.repetition_unit.key].present? }

  has_ancestry

  accepts_nested_attributes_for :spans, allow_destroy: true

  # Gives the keys of the valid repetition units for this scope. These are the available repetition units that are 'smaller' than the repetition unit of the parent.
  def valid_repetition_unit_keys
    keys = REPETITION_UNITS
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

  def matches?(time)
    self.spans.each do |s|
      return true if s.matches?(time)
    end
    return false

    # TEMP
    if self.repetition_unit.key == :infinite

    else
      rule = IceCube::Rule.send(self.repetition_unit.repetition_key)



      schedule = IceCube::Schedule.new
      schedule.add_recurrence_rule(rule)
    end
  end

  def active
    self.spans.each do |s|

    end
  end

  def instance_name
    self.name
  end
end
