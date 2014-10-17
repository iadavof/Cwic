# NotificationMailer to notify Cwic admins (IADA) about certain events
class NotificationMailer < ActionMailer::Base
  default from: %("Cwic Notifications" <notifications@cwic.nl>), to: 'info@iada.nl', subject: 'Notification'

  def newsletter_signup_notification(newsletter_signup)
    @newsletter_signup = newsletter_signup
    mail(subject: 'New newsletter subscription!')
  end
end
