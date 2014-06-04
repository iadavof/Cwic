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
end
