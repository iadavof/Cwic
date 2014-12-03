class Entity < ActiveRecord::Base
  include PgSearch
  include Sspable
  include Taggable

  # Associations
  belongs_to :entity_type, counter_cache: true
  belongs_to :organisation

  has_many :properties, class_name: 'EntityProperty', dependent: :destroy, inverse_of: :entity
  has_many :reservations, dependent: :destroy
  has_many :day_occupations, dependent: :destroy
  has_many :week_occupations, dependent: :destroy
  has_many :info_screen_entities, dependent: :destroy
  has_many :frontend_entities, dependent: :destroy
  has_many :stickies, as: :stickable, dependent: :destroy, inverse_of: :stickable
  has_many :images, class_name: 'EntityImage', as: :imageable, dependent: :destroy, inverse_of: :imageable
  has_many :documents, as: :documentable, dependent: :destroy, inverse_of: :documentable

  # Model extensions
  delegate :reservation_statuses, :default_reservation_status, :reservation_periods, :min_reservation_length, :min_reservation_length_seconds, :max_reservation_length, :max_reservation_length_seconds, to: :entity_type
  audited only: [:name, :entity_type_id, :description, :color, :include_entity_type_images, :frontend_name, :slack_before, :slack_after], allow_mass_assignment: true

  # Validations
  validates :entity_type, presence: true
  validates :organisation, presence: true
  validates :color, color: true
  validates :slack_before, numericality: { allow_blank: true, greater_than_or_equal_to: 0 }
  validates :slack_after, numericality: { allow_blank: true, greater_than_or_equal_to: 0 }

  # Callbacks
  after_initialize :init, if: :new_record?
  after_create :create_derived_entities
  after_save :update_reservations_slack_warnings

  # Nested attributes
  accepts_nested_attributes_for :properties, allow_destroy: true
  accepts_nested_attributes_for :images, allow_destroy: true, reject_if: :all_blank
  accepts_nested_attributes_for :documents, allow_destroy: true, reject_if: :all_blank

  # Scopes
  pg_global_search against: { name: 'A', description: 'B' }, associated_against: { entity_type: { name: 'B' }, properties: { value: 'C' }, stickies: { sticky_text: 'C' } }

  default_scope { order('id ASC') }

  # Class methods

  def self.available_between(begins_at, ends_at, options = {})
    # Note: there might be a more efficient way. Especially in combination with the max slack before and after retrieval used in EntitiesController#availability.
    self.all.find_all { |e| e.is_available_between?(begins_at, ends_at, options) }
  end

  # Instance methods

  def init
    self.color ||= Cwic::Color.random_hex_color
    self.build_properties if self.properties.blank?
  end

  def instance_name
    name.presence || default_name
  end

  def full_instance_name
    "#{entity_type.name}: #{instance_name}"
  end

  def default_name
    id.present? ? id.to_s : ''
  end

  def frontend_name
    read_attribute(:frontend_name).presence || self.instance_name
  end

  def slack_before
    super.present? ? super : entity_type.try(:slack_before)
  end

  # The maximum slack_before such that there is no collision with (the slack of) another reservation before the begins_at time
  # This value could be negative, indicating that the begins_at value always collides with (the slack of) another reservation
  def max_slack_before(begins_at)
    previous_reservation = Reservation.new(entity: self, begins_at: begins_at).previous
    (begins_at - previous_reservation.ends_at - previous_reservation.slack_after.minutes) / 1.minute if previous_reservation.present?
  end

  def slack_after
    super.present? ? super : entity_type.try(:slack_after)
  end

  # The maximum slack_after such that there is no collision with (the slack of) another reservation after the ends_at time
  # This value could be negative, indicating that the ends_at value always collides with (the slack of) another reservation
  def max_slack_after(ends_at)
    next_reservation = Reservation.new(entity: self, ends_at: ends_at).next
    (next_reservation.begins_at - next_reservation.slack_before.minutes - ends_at) / 1.minute if next_reservation.present?
  end

  def images(all = true)
    if all && include_entity_type_images
      super + entity_type.images
    else
      super
    end
  end

  def text_color
    Cwic::Color.text_color(self.color)
  end

  def reservation_matches_periods?(begins_at, ends_at)
    reservation_periods.empty? || reservation_cost(begins_at, ends_at).present? # TODO for now we consider every reservation valid if there are no reserve periods defined. Is this really the desired behaviour?
  end

  def reservation_cost(begins_at, ends_at)
    length = (ends_at - begins_at).round
    Cwic::Knapsack.new(reservation_periods.map { |rp| { c: rp.price, w: rp.length } }).solve_minimum(length)
  end

  def update_reservations_slack_warnings(force = false) # Also used in EntityType model so this method should be public
    if force || self.slack_before_changed? || self.slack_after_changed?
      self.reservations.each do |reservation|
        reservation.update_warning_state!
      end
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

  def is_available_between?(begins_at, ends_at, options = {})
    self.reservations.blocking.by_date_domain(begins_at, ends_at, options).empty?
  end

  private

  def create_derived_entities
    self.organisation.info_screens.each do |is|
      iset = InfoScreenEntityType.where('entity_type_id = ? AND info_screen_id = ?', self.entity_type.id, is.id).first;
      InfoScreenEntity.create(entity: self, info_screen_entity_type: iset, active: iset.add_new_entities)
    end

    self.organisation.frontends.each do |f|
      fet = FrontendEntityType.where('entity_type_id = ? AND frontend_id = ?', self.entity_type.id, f.id).first;
      FrontendEntity.create(entity: self, frontend_entity_type: fet, active: fet.add_new_entities)
    end
  end
end
