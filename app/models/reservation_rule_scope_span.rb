class ReservationRuleScopeSpan < ActiveRecord::Base
  include I18n::Alchemy

  belongs_to :scope

  validates :scope, presence: true
  validates :year_from, numericality: { only_integer: true }, allow_nil: true
  validates :month_from, numericality: { only_integer: true }, allow_nil: true
  validates :week_from, numericality: { only_integer: true }, allow_nil: true
  validates :holiday_from, inclusion: { in: proc { |record| record.relevant_holidays_keys() } }, allow_nil: true
  validates :dom_from, numericality: { only_integer: true }, allow_nil: true
  validates :nrom_from, numericality: { only_integer: true }, allow_nil: true
  validates :dow_from, numericality: { only_integer: true }, allow_nil: true
  validates :hour_from, numericality: { only_integer: true }, allow_nil: true
  validates :minute_from, numericality: { only_integer: true }, allow_nil: true
  validates :year_to, numericality: { only_integer: true }, allow_nil: true
  validates :month_to, numericality: { only_integer: true }, allow_nil: true
  validates :week_to, numericality: { only_integer: true }, allow_nil: true
  validates :holiday_to, inclusion: { in: proc { |record| record.relevant_holidays_keys() } }, allow_nil: true
  validates :dom_to, numericality: { only_integer: true }, allow_nil: true
  validates :nrom_to, numericality: { only_integer: true }, allow_nil: true
  validates :dow_to, numericality: { only_integer: true }, allow_nil: true
  validates :hour_to, numericality: { only_integer: true }, allow_nil: true
  validates :minute_to, numericality: { only_integer: true }, allow_nil: true

  normalize_attributes :holiday_from, :holiday_to

  def relevant_holidays
    Holidays.between(Date.today.beginning_of_year, Date.today.end_of_year, I18n.locale)
  end

  def relevant_holidays_keys
    relevant_holidays.map { |h| h[:key] }
  end

  def matches?(time)
    parsed_span.cover?(parse_time(time))
  end

  def parsed_span
    from = parsed_value(:from)
    to = parsed_value(:to)
    from..to
  end

  def parse_time(time)
    case self.scope.repetition_unit.key
    when :infinite
      time.to_date
    when :year
      case self.scope.span_type
      when :dates
       time.to_date.change(year: 2000)
      when :weeks
        time.to_date.cweek # TODO last?
      when :holidays
        raise "Not yet implemented"
      end
    when :month
      case self.scope.span_type
      when :days
        time.to_date.change(year: 2000, month: 5) # TODO last?
      when :nr_dow_of
        NrDowOfMonth.from_date(time.to_date) # TODO last?
      end
    when :week
      time.to_date.cwday
    when :day
      time.to_tod
    end
  end

  def parsed_value(from_to)
    case self.scope.repetition_unit.key
    when :infinite
      Date.new(value(:year, from_to), value(:month, from_to), value(:dom, from_to))
    when :year
      case self.scope.span_type
      when :dates
        Date.new(2000, value(:month, from_to), value(:dom, from_to))
      when :weeks
        value(:week, from_to)
      when :holidays
        raise "Not yet implemented"
      end
    when :month
      case self.scope.span_type
      when :days
        Date.new(2000, 5, value(:dom, from_to))
      when :nr_dow_of
        NrDowOfMonth.new(value(:nrom, from_to), value(:dow, from_to))
      end
    when :week
      value(:dow, from_to)
    when :day
      TimeOfDay.new(value(:hour, from_to), value(:minute, from_to))
    end
  end

  def value(key, from_to)
    self.send("#{key}_#{from_to}")
  end

  def instance_name
    "TODO"
  end
end
