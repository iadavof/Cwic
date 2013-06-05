# Load the rails application.
require File.expand_path('../application', __FILE__)

ActionMailer::Base.delivery_method = :sendmail
ActionMailer::Base.sendmail_settings {
}

# Initialize the rails application.
Cwic::Application.initialize!
