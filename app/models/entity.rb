class Entity < ActiveRecord::Base
  include PgSearch
  include Sspable

  has_many :properties, class_name: 'EntityProperty', dependent: :destroy, inverse_of: :entity
  has_many :reservations, dependent: :destroy
  has_many :day_occupations, dependent: :destroy
  has_many :week_occupations, dependent: :destroy
  has_many :info_screen_entities, dependent: :destroy
  has_many :stickies, as: :stickable, dependent: :destroy, inverse_of: :stickable
  has_many :entity_images, as: :entity_imageable, dependent: :destroy

  belongs_to :entity_type, counter_cache: true
  belongs_to :organisation

  validates :entity_type_id, presence: true
  validates :entity_type, presence: true, if: 'entity_type_id.present?'
  validates :organisation, presence: true
  validates :color, color: true

  validates :slack_before, numericality: { allow_blank: true, greater_than_or_equal_to: 0 }
  validates :slack_after, numericality: { allow_blank: true, greater_than_or_equal_to: 0 }

  after_initialize :init, if: :new_record?
  after_create :create_info_screen_entities
  after_save :update_reservations_slack_warnings

  accepts_nested_attributes_for :properties, allow_destroy: true
  accepts_nested_attributes_for :entity_images, allow_destroy: true

  delegate :reserve_periods, :min_reservation_length, :min_reservation_length_seconds, :max_reservation_length, :max_reservation_length_seconds, to: :entity_type

  default_scope { order('id ASC') }

  pg_global_search against: { name: 'A', description: 'B' }, associated_against: { entity_type: { name: 'B' }, properties: { value: 'C' }, stickies: { sticky_text: 'C' } }

  def init
    self.color ||= Cwic::Color.random_hex_color
    self.build_properties if self.properties.blank?
  end

  def instance_name
    self.name.present? ? self.name : self.default_name
  end

  def full_instance_name
    "#{self.entity_type.name}: #{self.name}"
  end

  def frontend_name
    read_attribute(:frontend_name) || self.instance_name
  end

  def default_name
    if self.id.present?
      self.id.to_s
    else
      ''
    end
  end

  def get_slack_before
    return read_attribute(:slack_before) if read_attribute(:slack_before).present?
    return self.entity_type.slack_before
  end

  def get_slack_after
    return read_attribute(:slack_after) if read_attribute(:slack_after).present?
    return self.entity_type.slack_after
  end

  def update_reservations_slack_warnings(force = false)
    if force || self.slack_before_changed? || self.slack_after_changed?
      self.reservations.each do |reservation|
        reservation.update_warning_state!
      end
    end
  end

  def all_entity_images
    if include_entity_type_images
      entity_images + entity_type.entity_images
    else
      entity_images
    end
  end

  def text_color
    Cwic::Color.text_color(self.color)
  end

  def create_info_screen_entities
    self.organisation.info_screens.each do |is|
      iset = InfoScreenEntityType.where('entity_type_id = ? AND info_screen_id = ?', self.entity_type.id, is.id).first;
      InfoScreenEntity.create(entity: self, info_screen_entity_type: iset, active: iset.add_new_entities)
    end
  end

  def rebuild_properties
    self.properties.clear
    self.build_properties
  end

  def build_properties
    if self.entity_type.present?
      self.properties.build(self.entity_type.properties.map { |pt| { property_type: pt } })
    end
  end

  # Set property values by an list/array (matching array index on property index) or hash (matching hash key on property name or index depending on key type)
  def set_properties(*values)
    if values.size == 1 && values.first.is_a?(Hash)
      # We are dealing with a hash
      values.first.each do |key, index|
        self.set_property(key, value)
      end
    else
      # We are dealing with a list/array
      values.flatten.each_with_index do |value, index|
        self.set_property(index, value)
      end
    end
  end

  def set_property(name_or_index, value)
    property = self.properties.detect { |p| name_or_index.is_a?(Integer) ? p.property_type.index == name_or_index : p.property_type.name == name_or_index }
    raise "Unknown property #{name} for entity of type #{self.entity_type.instance_name}" if property.nil?
    property.set_value(value)
  end

  def reservation_matches_periods?(begins_at, ends_at)
    reservation_cost(begins_at, ends_at).present?
  end

  def reservation_cost(begins_at, ends_at)
    length = (ends_at - begins_at).round
    Cwic::Knapsack.new(reserve_periods.map { |rp| { c: rp.price, w: rp.length } }).solve_minimum(length)
  end
end
