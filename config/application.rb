require File.expand_path('../boot', __FILE__)
require 'csv'
require 'rails/all'

I18n.config.enforce_available_locales = true # Set enforce_available_locales to prevent deprecation warning. Do this here to prevent gems from beating us to it.

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module Cwic
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    config.time_zone = 'Amsterdam'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]\
    config.i18n.default_locale = :nl

    # Custom directories with classes and modules you want to be autoloadable.
    config.autoload_paths += %W(#{config.root}/lib)
    config.autoload_paths += %W(#{config.root}/lib/core_ext)

    # Precompile jquery libraries for the case that CDN is not available
    config.assets.precompile += ['jquery.js', 'jquery.ui.all.js']

    # Load core extensions (only autoloading is not enough, since the String class is already loaded and therefore the core_ext will not be loaded anymore)
    Dir[File.join(Rails.root, 'lib', 'core_ext', '*.rb')].each { |l| require l }

    config.generators do |g|
	   g.stylesheets false
    end
  end
end
