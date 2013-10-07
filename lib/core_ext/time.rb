class Time
  def to_tod
    TimeOfDay.new(self.hour, self.min, self.sec)
  end
end