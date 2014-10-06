class NewsletterSignup < ActiveRecord::Base
  # Validations
  validates :email, presence: true, length: { maximum: 255 }, uniqueness: true, email: { mx: true, ban_disposable_email: true }

  def instance_name
    self.email
  end
end
