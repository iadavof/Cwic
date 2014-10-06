class Forgery::Internet
  def self.email_address
    user_name + '@' + real_domain_names.sample
  end

  def self.real_domain_names
    %w(iada.nl gmail.com hotmail.com live.nl)
  end
end
