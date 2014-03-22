# Based on production defaults
require Rails.root.join("config/environments/production")

Cwic::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb and config/environments/production.

  # Verbose logging in staging mode.
  config.log_level = :debug

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Send mails from staging.cwic.nl
  config.action_mailer.default_url_options = { host: 'staging.cwic.nl' }

  # Enable this line when running staging on a local machine (using Rails' default web server) to enable static assets serving
  config.serve_static_assets = true
end
