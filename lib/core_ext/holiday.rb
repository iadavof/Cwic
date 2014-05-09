# Represents a day in a month by specifying the numberth weekday (for example third tuesday of month)
class Holiday3
  include Comparable

  attr :locale, :holiday

  # nr is number between 1 and 5, where 1 represents first and 5 represents last
  # dow is number between 1 and 7, where 1 represents monday and 7 represents sunday
  def initialize(string)
    split = string.split(':')
    @locale = split[0].to_sym
    @holiday = split[1].to_sym
  end

  # This object does not have a real successor
  def succ
    NrDowOfMonth.new(self.to_s)
  end

  def <=>(other)
    self.to_s <=> other.to_s
  end

  def to_s
    "#{locale}:#{holiday}"
  end
end
