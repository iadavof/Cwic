source 'http://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 4.1.4'

# Use postgresql as the database for Active Record
gem 'pg'

# Use SCSS for stylesheets
gem 'sass-rails'

# Use autoprefixer to add browser prefixes to css rules
gem 'autoprefixer-rails'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use CoffeeScript for .js.coffee assets and views
# gem 'coffee-rails', '~> 4.0.0'

# See https://github.com/sstephenson/execjs#readme for more supported runtimes
gem 'therubyracer', platforms: :ruby

# Use jquery as the JavaScript library, by default get them from cdn
gem 'jquery-rails'
gem 'jquery-rails-cdn'
gem 'jquery-ui-rails'
gem 'jquery-ui-rails-cdn'

# Use Modernizr to detect support for new features
gem 'modernizr-rails'

# Use the gistyle gem for the Garber Irish Javascript loading implementation
gem 'gistyle', github: 'tonytonyjan/gistyle'

# Color picker
gem 'jquery-minicolors-rails'

# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder'

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

# Rails-i18n for standard rails locales
gem 'rails-i18n'

# Plurailize
gem 'rich_pluralization', github: 'archan937/rich_pluralization'

# Devise for authentication. Gems are locked on minor versions, because we use custom Devise functionality and views.
gem 'devise', '~> 3.2.4'
gem 'devise_invitable', '~> 1.3.5'
gem 'devise-i18n', '~> 0.10.3'
gem 'devise-i18n-views', '~> 0.2.8'

# Use CanCan for access control / authorisation
gem 'cancan'

# Use I18n alchemy gem for easy number (and possibly date) parsing and localization in forms
gem 'i18n_alchemy'

# Responders gem for nice and easy responses after CRUD actions
gem 'responders'

# Nested forms helpers
gem 'nested_form'

# Image uploads
gem 'mini_magick'
gem 'carrierwave'

# Image galery
gem 'magnific-popup-rails'

# ActiveRecord Import for multi INSERTs at once
gem 'activerecord-import'

# Active model tableless for using tableless models in a nested form
gem 'activerecord-tableless'

# Ancestry gem for ActiveRecord tree helpers
gem 'ancestry'

# Route functions in JavaScript
gem 'js-routes'

# Javascript MomentJS for date formatting and alterations
gem 'momentjs-rails'

# search in selects
gem 'select2-rails'

# PG_Search for easy text search and global searching
gem 'pg_search', '~> 0.7.3' # Locked on minor version, because we use custom search functionality (see lib/core_ext/pg_search.rb).

# Easy pagination (and unfortunately unefficient due to unnecessary queries)
gem 'kaminari'

# Websockets so we could create push notifications
gem 'websocket-rails', github: 'kreintjes/websocket-rails' # Custom websocket-rails gem because the standard version is not Windows comptabile.

# Organisation of the seeds
gem 'seedbank'

# Holidays gem to determine the dates of holidays. Custom gem to add keys and kings day
gem 'holidays', github: 'kreintjes/holidays' #path: '~/rails/gems/holidays'github: 'kreintjes/holidays'

# Translate numbers to words (and ordinal forms). Custom gem to add ordinal support for dutch locale.
gem 'numbers_and_words', github: 'kreintjes/numbers_and_words' #path: '~/rails/gems/numbers_and_words'

# Attribute normalizer to normalize/cleanup attribute values (for instance change blanks to nils)
gem 'attribute_normalizer', '~> 1.2.0.b'

# Ice cube gem for easy recurrence rules
gem 'ice_cube'

# Repeat (filter) get fields as hidden fields
gem 'hash_to_hidden_fields'

# Validator for timeliness of dates
gem 'validates_timeliness'

# Make ActiveRecord objects deep clonable (dup) including associations
gem 'deep_cloneable'

# Factory girl to generate data for tests (this is a replacement for fixtures)
gem 'factory_girl_rails'

# The forgery fake data generator (useful for testing)
gem 'forgery'

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin]

# Symbolizes Active Record attributes and validates them against a list
gem 'symbolize'

group :development do
  # Disable messages about assets in development
  gem 'quiet_assets'

  # Pry for easy debugging
  gem 'pry-rails'

  # Bullet for warnings about potential query optimalisations
  gem 'bullet'

  # Spring gem for application pre-loading leading to faster Rails commands
  gem 'spring'
end

group :test, :development do
  # The RSpec testing framework
  gem 'rspec-rails'

  # The debugger gem
  gem 'debugger'
end

group :test do
  # The database cleaner gem to wipe the database (with support for multiple strategies)
  gem 'database_cleaner'
end
