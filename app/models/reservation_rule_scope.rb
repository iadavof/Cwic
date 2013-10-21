class ReservationRuleScope < ActiveRecord::Base
  include I18n::Alchemy

  belongs_to :entity
  belongs_to :repetition_unit, class_name: 'TimeUnit'
  has_many :spans, class_name: 'ReservationRuleScopeSpan', dependent: :destroy, inverse_of: :scope, foreign_key: 'scope_id'
  #has_many :childs, class_name: 'ReservationRuleScope', as: :parent

  validates :entity_id, presence: true
  validates :entity, presence: true, if: "entity_id.present?"
  validates :name, presence: true, length: { maximum: 255 }
  validates :repetition_unit_id, presence: true
  validates :repetition_unit, presence: true, if: "repetition_unit_id.present?"

  has_ancestry

  accepts_nested_attributes_for :spans, allow_destroy: true

  def instance_name
    self.name
  end
end
