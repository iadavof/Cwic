# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

# Create default Roles
or1 = OrganisationRole.create(name: 'Administrator')

# Create test administrator user
u1 = User.create(first_name: 'Admin', last_name: 'IADA', email: 'admin@iada.nl', password: 'bla12345', confirmed_at: DateTime.now)
o1 = Organisation.create(name: 'IADA', street: 'Stationsplein', house_number: '13-22', postal_code: '6512 AB', city: 'Nijmegen', country: 'Netherlands')
ou1 = OrganisationUser.create(organisation: o1, user: u1, organisation_role: or1)
