# Based on production defaults
require Rails.root.join('config/environments/production')

Cwic::Application.configure do
  # Settings specified here take precedence over those in config/application.rb and config/environments/production.

  # Verbose logging in staging mode.
  config.log_level = :debug

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Send mails from staging.cwic.nl
  config.action_mailer.default_url_options = { host: 'staging.cwic.nl' }

  # Enable sessions on staging (only user's with an account can login any way)
  config.disable_sessions = false
end
