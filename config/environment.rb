# Load the rails application.
require File.expand_path('../application', __FILE__)

# Set the ActionMailer delivery method
ActionMailer::Base.delivery_method = :sendmail

# Initialize the rails application.
Cwic::Application.initialize!
