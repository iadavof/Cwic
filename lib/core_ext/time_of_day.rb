# Class that represents a time of the day (so something like HH:MM:SS).
# Basically it is just a subclass of Time, without any special methods/attributes.
# We use this merely to make clear we want only a time and not the date.
class TimeOfDay < Time
  def initialize(hour, min = nil, sec = nil)
    super(1970, 1, 1, hour, min, sec)
  end
end
