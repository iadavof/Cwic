# Create test users
iada_user = User.create!(first_name: 'Admin', last_name: 'IADA', email: 'admin@iada.nl', password: 'cwictest', confirmed_at: DateTime.now)
christiaan_user = User.create!(first_name: 'Christiaan', last_name: 'Thijssen', email: 'christiaan@iada.nl', password: 'cwictest', confirmed_at: DateTime.now)

# Create IADA organisation and add users
iada = Organisation.create!(name: 'IADA', route: 'Stationsplein', street_number: '13-22', administrative_area_level_1: 'Gelderland', administrative_area_level_2: 'Nijmegen', postal_code: '6512 AB', locality: 'Nijmegen', country: 'Netherlands', lat: 51.8430002, lng: 5.85445019999997)
OrganisationUser.create!(organisation: iada, user: christiaan_user, organisation_role: SeedHelper.viewer_role)
OrganisationUser.create!(organisation: iada, user: iada_user, organisation_role: SeedHelper.admin_role)

# Create test entity type
test_entity_type = EntityType.create!(organisation: iada, name: 'Object', description: 'Een test objecttype')
test_entity_type.reserve_periods.create(period_unit: TimeUnit.find_by(key: :minute), price: 100)

# Create test entity
Entity.create!(organisation: iada, entity_type: test_entity_type, name: 'Object 1', description: 'Een test object')

# Create test client
OrganisationClient.create!(organisation: iada, first_name: 'Test', last_name: 'Klant', email: 'test@iada.nl', route: 'Stationsplein', street_number: '13-22', administrative_area_level_1: 'Gelderland', administrative_area_level_2: 'Nijmegen', postal_code: '6512 AB', locality: 'Nijmegen', country: 'Netherlands', lat: 51.8430002, lng: 5.85445019999997)
OrganisationClient.create!(organisation: iada, first_name: 'Christiaan', last_name: 'Thijssen', email: 'christiaanthijssen@iada.nl', route: 'Grote Loef', street_number: '75', administrative_area_level_1: 'Gelderland', administrative_area_level_2: 'Heumen', postal_code: '6581 JE', locality: 'Malden', country: 'Netherlands', lat: 51.7808067, lng: 5.850443799999994)
OrganisationClient.create!(organisation: iada, first_name: 'Floris', infix: 'de', last_name: 'Lange', email: 'florisdelange@iada.nl', route: 'Hegdambroek', street_number: '2213', administrative_area_level_1: 'Gelderland', administrative_area_level_2: 'Nijmegen', postal_code: '6546 WE', locality: 'Nijmegen', country: 'Netherlands', lat: 51.8292613, lng: 5.784979000000021)
OrganisationClient.create!(organisation: iada, first_name: 'Kevin', last_name: 'Reintjes', email: 'kevinreintjes@iada.nl', route: 'Molenweg', street_number: '87', administrative_area_level_1: 'Gelderland', administrative_area_level_2: 'Nijmegen', postal_code: '6542 PT', locality: 'Nijmegen', country: 'Netherlands', lat: 51.8393641, lng: 5.837275900000009)
