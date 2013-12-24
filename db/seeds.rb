# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

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
or1 = OrganisationRole.create!(name: 'Administrator')
OrganisationRole.create!(name: 'Planner')
OrganisationRole.create!(name: 'Viewer')

# Create test administrator user
u1 = User.create!(first_name: 'Admin', last_name: 'IADA', email: 'admin@iada.nl', password: 'cwictest', confirmed_at: DateTime.now)
o1 = Organisation.create!(name: 'IADA', route: 'Stationsplein', street_number: '13-22', administrative_area_level_1: 'Gelderland', administrative_area_level_2: 'Nijmegen', postal_code: '6512 AB', locality: 'Nijmegen', country: 'Netherlands', lat: 51.8430002, lng: 5.85445019999997)
ou1 = OrganisationUser.create!(organisation: o1, user: u1, organisation_role: or1)

# Create the default entity type icon
EntityTypeIcon.create!(name: 'Object')

# Create test entity type
et1 = EntityType.create!(organisation: o1, name: 'Object', description: 'A sample object type to use for test purposes')

# Create test entity
Entity.create!(organisation: o1, entity_type: et1, name: 'Object 1', description: 'A sample object to use for test purposes')

# Create test client
OrganisationClient.create!(organisation: o1, first_name: 'Test', last_name: 'Klant', email: 'test@iada.nl', route: 'Stationsplein', street_number: '13-22', administrative_area_level_1: 'Gelderland', administrative_area_level_2: 'Nijmegen', postal_code: '6512 AB', locality: 'Nijmegen', country: 'Netherlands', lat: 51.8430002, lng: 5.85445019999997)