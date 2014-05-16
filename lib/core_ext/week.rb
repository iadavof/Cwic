# Represents a week in a certain year
class Week
  include Comparable
  attr :year, :week

  def initialize(year, week)
    @year = year
    @week = week
  end

  # Amount of weeks in this year
  def weeks_in_year
    Week.weeks_in_year(@year)
  end

  def succ
    week = @week + 1
    year = @year
    if week > weeks_in_year
      week = 1
      year += 1
    end
    Week.new(year, week)
  end

  def <=>(other)
    if @year == other.year
      @week <=> other.week
    else
      @year <=> other.year
    end
  end

  def to_i
    (0..@year).map(&:weeks_in_year).sum + @week
  end

  def to_s
    @year.to_s + @week.to_s
  end

  def to_date
    Date.commercial(@year, @week)
  end
  alias_method :to_begin_date, :to_date

  def to_end_date
    to_date + 6.days # 6 days to get to the last day in this week
  end

  def to_days
    to_begin_date..to_end_date
  end

  def self.weeks_in_year(year)
    Date.new(year, 12, 28).cweek
  end

  def self.from_date(date)
    # ISO 8601 week-based year and week: cwyear gives the week-based year; cweek gives the week number of the week-based year (1-53).
    # For some years the first few days of this year could have the previous year as cwyear (and cweek at 52 or 53).
    Week.new(date.cwyear, date.cweek)
  end
end
