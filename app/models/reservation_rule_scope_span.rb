class ReservationRuleScopeSpan < ActiveRecord::Base
  include I18n::Alchemy

  BASE_YEAR = 2000 # The year used for scopes with repetition yearly or less. Must be a leap year.
  BASE_MONTH = 5 # The month used for scoped with repetition monthly or less. For convenience this must be the same mont as used in the JavaScript GUI (which is may, since may starts on a monday in the BASE_YEAR).

  belongs_to :scope, class_name: 'ReservationRuleScope'

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
    relevant_holidays.map { |h| "#{I18n.locale}:#{h[:key]}" }
  end

  # Determines of this span matches a certain time
  def matches?(time)
    if self.scope.repetition_unit.key == :year && self.scope.span_type == :holidays
      matches_holiday?(time)
    else
      parsed_span.cover?(parse_time(time))
    end
  end

  # Determines the width of this span in seconds
  def width
    case self.scope.repetition_unit.key
    when :infinite
      date_span_width
    when :year
      case self.scope.span_type
      when :dates
        date_span_width
      when :weeks
        (parsed_span.last - parsed_span.first + 1) * 1.week
      when :holidays
        1.day
      end
    when :month
      case self.scope.span_type
      when :days
        date_span_width
      when :nr_dow_of
        (parsed_span.last.to_i - parsed_span.first.to_i + 1) * 1.day
      end
    when :week
      (parsed_span.last - parsed_span.first + 1) * 1.day
    when :day
      (range.last - range.first + 1.minute).to_i
    end
  end

  def instance_name
    "TODO"
  end

private
  def matches_holiday?(time)
    # Holidays do not support ranges. We therefore only look at the from values. This value is a string in the format <locale>:<holiday_key>
    (locale, key) = value(:holiday, :from).split(':')
    Holidays.on(time, locale).any? { |h| h[:key] == key }
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
       time.to_date.change(year: BASE_YEAR)
      when :weeks
        time.to_date.cweek
      when :holidays
        Holidays.on(time)
      end
    when :month
      case self.scope.span_type
      when :days
        time.to_date.change(year: BASE_YEAR, month: BASE_MONTH)
      when :nr_dow_of
        NrDowOfMonth.from_date(time.to_date)
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
        Date.new(BASE_YEAR, value(:month, from_to), value(:dom, from_to))
      when :weeks
        value(:week, from_to)
      when :holidays
        value(:holiday, from_to)
      end
    when :month
      case self.scope.span_type
      when :days
        Date.new(BASE_YEAR, BASE_MONTH, value(:dom, from_to))
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

  def date_span_width
    span = parsed_span
    ((span.last - span.first).to_i + 1) * 1.day
  end
end
