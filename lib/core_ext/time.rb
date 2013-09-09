class Time
  def to_tod
    TimeOfDay.new(0, 1, 1, self.hour, self.min, self.sec)
  end
end