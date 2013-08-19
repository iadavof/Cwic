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

# Create default roles
or1 = OrganisationRole.create!(name: 'Administrator')
OrganisationRole.create!(name: 'Planner')
OrganisationRole.create!(name: 'Viewer')

# Create test administrator user
u1 = User.create!(first_name: 'Admin', last_name: 'IADA', email: 'admin@iada.nl', password: 'cwictest', confirmed_at: DateTime.now)
o1 = Organisation.create!(name: 'IADA', street: 'Stationsplein', house_number: '13-22', postal_code: '6512 AB', city: 'Nijmegen', country: 'Netherlands')
ou1 = OrganisationUser.create!(organisation: o1, user: u1, organisation_role: or1)

EntityTypeIcon.create!(name: 'Object')