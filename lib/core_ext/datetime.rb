class Datetime
  def to_tod
    TimeOfDay.new(hour, min, tod.sec)
  end
end
