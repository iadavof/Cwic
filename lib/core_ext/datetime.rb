class Datetime
  def to_tod
    TimeOfDay.new(0, 0, 0, self.hour, self.min, tod.sec)
  end
end