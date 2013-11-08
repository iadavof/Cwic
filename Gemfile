source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.0.1'

# Use postgresql as the database for Active Record
gem 'pg'

# Use SCSS for stylesheets
gem 'sass-rails'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use CoffeeScript for .js.coffee assets and views
gem 'coffee-rails', '~> 4.0.0'

# See https://github.com/sstephenson/execjs#readme for more supported runtimes
gem 'therubyracer', platforms: :ruby

# Use jquery as the JavaScript library, by default get them from cdn
gem 'jquery-rails'
gem 'jquery-rails-cdn'
gem 'jquery-ui-rails'
gem 'jquery-ui-rails-cdn', github: 'CUnknown/jquery-ui-rails-cdn'

# Use Modernizr to detect support for new features
gem 'modernizr-rails'

# Use the gistyle gem for the Garber Irish Javascript loading implementation
gem 'gistyle'

# Color picker
gem 'jquery-minicolors-rails'

# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 1.0.1'

group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

# Use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# Use unicorn as the app server
# gem 'unicorn'

# Use Capistrano for deployment
# gem 'capistrano', group: :development

# Use debugger
gem 'debugger', group: [:development, :test]

# Rails-i18n for standard rails locales
gem 'rails-i18n'

# Plurailize
gem 'rich_pluralization', github: 'archan937/rich_pluralization'

# Devise for authentication
gem 'devise'
gem 'devise_invitable'
gem 'devise-i18n'
gem 'devise-i18n-views'

# Use CanCan for access control / authorisation
gem 'cancan'

# Use I18n alchemy gem for easy number (and possibly date) parsing and localization in forms
gem 'i18n_alchemy', github: 'carlosantoniodasilva/i18n_alchemy'

# Responders gem for nice and easy responses after CRUD actions
gem 'responders'

# Nested forms helpers
gem 'nested_form'

# Image uploads
gem 'mini_magick', github: 'minimagick/minimagick' # Temporary use master branch because of problem with 3.6.0 on Windows (when new version is released switch to that version).
gem 'carrierwave'

# Image galery
gem 'magnific-popup-rails'

# ActiveRecord Import for multi INSERTs at once
gem 'activerecord-import'

# Ancestry gem for ActiveRecord tree helpers
gem 'ancestry'

# Route functions in JavaScript
gem 'js-routes'

# Javascript MomentJS for date formatting and alterations
gem 'momentjs-rails', github: 'CUnknown/momentjs-rails'

# PG_Search for easy text search and global searching
gem 'pg_search'

# Websockets so we could create push notifications
gem 'websocket-rails'

group :development do
  # Disable messages about assets in development
  gem 'quiet_assets'
  # Pry for easy debugging
  gem 'pry-rails'
end

group :test, :development do
  # The RSpec testing framework
  gem 'rspec-rails'
  # Factory girl to generate data for tests (this is a replacement for fixtures)
  gem 'factory_girl_rails'
end

group :test do
  # The forgery fake data generator (useful for testing)
  gem 'forgery'
  # The database cleaner gem to wipe the database (with support for multiple strategies)
  gem 'database_cleaner'
end