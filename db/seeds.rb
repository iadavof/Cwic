# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
I18n.locale = :nl

# Create default data types
DataType.create!([
  { key: 'string', rails_type: 'String', form_type: 'text_field' },
  { key: 'text', rails_type: 'String', form_type: 'text_area' },
  { key: 'integer', rails_type: 'Integer', form_type: 'text_field' },
  { key: 'float', rails_type: 'Float', form_type: 'text_field' },
  { key: 'boolean', rails_type: 'Boolean', form_type: 'check_box' },
  { key: 'enum', rails_type: 'String', form_type: 'collection_select' },
  { key: 'set', rails_type: 'Array', form_type: 'collection_select_multi' },
])

# Create default time periods
# TODO? Remove common since it is not used anymore.
TimeUnit.create!([
  { key: 'second', repetition_key: 'secondly', common: false, seconds: 1.second },
  { key: 'minute', repetition_key: 'minutely', common: false, seconds: 1.minute },
  { key: 'quarter', repetition_key: 'quarterly', common: true, seconds: 15.minutes },
  { key: 'half_hour', repetition_key: 'half_hourly', common: true, seconds: 30.minutes },
  { key: 'hour', repetition_key: 'hourly', common: true, seconds: 1.hour },
  { key: 'day', repetition_key: 'daily', common: true, seconds: 1.day },
  { key: 'week', repetition_key: 'weekly', common: true, seconds: 1.week },
  { key: 'month', repetition_key: 'monthly', common: false, seconds: 1.month },
  { key: 'year', repetition_key: 'yearly', common: false, seconds: 1.year.to_i },
  { key: 'infinite', repetition_key: nil, common: false, seconds: 1.year.to_i + 1}
])

# Create default roles
OrganisationRole.create!(name: 'Administrator')
OrganisationRole.create!(name: 'Planner')
OrganisationRole.create!(name: 'Viewer')

# Create the default entity type icon
EntityTypeIcon.create!(name: 'Object')
