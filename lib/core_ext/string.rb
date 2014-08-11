class String
  def ucfirst
    self.clone.ucfirst!
  end

  def ucfirst!
    self[0] = self[0,1].upcase
    self
  end

  def lcfirst
    self.clone.lcfirst!
  end

  def lcfirst!
    self[0] = self[0,1].downcase
    self
  end

  def to_tod
    self.to_time.to_tod
  end

  def pl
    return self # Temporary fix to disable the rich_pluralization gem since it is broken with the Rails 4.1.4 upgrade. TODO fix this!
  end

  # Comparator to sort strings such that letters (alphabetic characters) come before numbers and other characters
  def alphasort(other)
    length = (self.length < other.length) ? self.length : other.length
    0.upto(length-1) do |i|
      # normally we would just return the result of self[i] <=> other[i]. But
      # you need a custom sorting function.
      if self[i] == other[i]
        next # characters the same, skip to next character.
      else
        if self[i] =~ /[a-zA-Z]/
          if other[i] =~ /[a-zA-Z]/
            return self[i] <=> other[i]  # both alphabetic, sort normally.
          else
            return -1  # self is alphabetic, other is not, so self is sorted before.
          end
        elsif other[i] =~ /[a-zA-Z]/
          return 1  # self is not numeric, other is, so self is sorted after.
        else
          return self[i] <=> other[i] # both non-alphabetic, sort normally.
        end
      end
    end

    # if we got this far, the segments were identical. However, they may
    # not be the same length. Short sorted before long.
    return self.length <=> other.length
  end
end
