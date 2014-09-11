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

  # Comparator to sort strings such that letters (alphabetic characters) come before numbers and other characters
  def alphasort(other)
    0.upto((self.length < other.length ? self.length : other.length) - 1) do |i|
      next if self[i] == other[i] # Characters the same, skip to next character.
      if self[i] =~ /[a-zA-Z]/ && !(other[i] =~ /[a-zA-Z]/)
        return -1  # Self is alphabetic, other is not, so self is sorted before
      elsif !(self[i] =~ /[a-zA-Z]/) && other[i] =~ /[a-zA-Z]/
        return 1 # Self is not alphabetic, other is, so self is sorted after
      else
        return self[i] <=> other[i] # Simply sort like we would normally
      end
    end
    self.length <=> other.length # Segments are identical, but strings may not be of equal length. Sort short before long.
  end
end
