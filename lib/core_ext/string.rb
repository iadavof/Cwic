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
end
