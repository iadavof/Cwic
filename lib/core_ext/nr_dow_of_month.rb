# Represents a day in a month by specifying the numberth weekday (for example third tuesday of month)
class NrDowOfMonth
  include Comparable

  DAYS_IN_WEEK = 7

  attr :nr, :dow

  # nr is number between 1 and 5, where 1 represents first and 5 represents last
  # dow is number between 1 and 7, where 1 represents monday and 7 represents sunday
  def initialize(nr, dow)
    @nr = nr
    @dow = dow
  end

  def succ
    dow = @dow + 1
    nr = @nr
    if dow > DAYS_IN_WEEK
      dow = 1
      nr += 1
    end
    NrDowOfMonth.new(nr, dow)
  end

  def <=>(other)
    if @nr == other.nr
      @dow <=> other.dow
    else
      @nr <=> other.nr
    end
  end

  # Represents the object as an integer between 1 (first monday) and 35 (fifth sunday)
  def to_i
    (@nr - 1) * DAYS_IN_WEEK + @dow
  end

  def to_s
    @nr.to_s + @dow.to_s
  end

  def to_date(year, month)
    # Get the first day of this month
    first = Date.new(year, month, 1)
    # Calculate the day (of month) by getting the integer representation and substract the correction for the first dow of this month
    day = self.to_i - first.cwday + 1
    # If the month started at a dow after the dow we want, then we need to correct for this by adding the amount of days in a week to the date
    day = day + DAYS_IN_WEEK if self.dow < first.cwday
    # Change the date to the correct day
    first.change(day: day)
  end

  def self.from_date(date)
    dow = date.cwday
    nr = (date.day.to_f / DAYS_IN_WEEK).ceil
    NrDowOfMonth.new(nr, dow)
  end
end
