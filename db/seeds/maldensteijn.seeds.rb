after 'iada' do
  iada_user = User.find_by!(email: 'admin@iada.nl')
  christiaan_user = User.find_by!(email: 'christiaan@iada.nl')

  # Create Maldensteijn admin user
  ard_user = User.create!(first_name: 'Ard', infix: 'van', last_name: 'Hulst', email: 'ard@maldensteijn.nl', password: 'cwictest', confirmed_at: DateTime.now)
  david_user = User.create!(first_name: 'David', last_name: 'Westen', email: 'david@maldensteijn.nl', password: 'cwictest', confirmed_at: DateTime.now)

  # Create Maldensteijn organisation
  maldensteijn = Organisation.create!(name: 'Maldensteijn', route: 'Kerkplein', street_number: '8a', administrative_area_level_1: 'Gelderland', administrative_area_level_2: 'Heumen', postal_code: '6581 AC', locality: 'Malden', country: 'Netherlands', lat: 51.7808067, lng: 5.850443799999994)

  # Add users to Maldensteijn organisation
  OrganisationUser.create!(organisation: maldensteijn, user: ard_user, organisation_role: SeedHelper.admin_role)
  OrganisationUser.create!(organisation: maldensteijn, user: iada_user, organisation_role: SeedHelper.admin_role)
  OrganisationUser.create!(organisation: maldensteijn, user: christiaan_user, organisation_role: SeedHelper.planner_role)
  OrganisationUser.create!(organisation: maldensteijn, user: david_user, organisation_role: SeedHelper.viewer_role)

  # Create entity type property templates
  people_property = EntityTypeProperty.new(name: 'Max. personen', description: 'Het maximale aantal personen', data_type: SeedHelper.data_type(:integer), required: true, index: 0)
  seats_property = EntityTypeProperty.new(name: 'Zitplaatsen', description: 'Het aantal beschikbare zitplaatsen', data_type: SeedHelper.data_type(:integer), required: true, index: 1)
  area_property = EntityTypeProperty.new(name: 'Oppervlakte', description: 'De oppervlakte in m²', data_type: SeedHelper.data_type(:float), index: 2)
  drinks_property = EntityTypeProperty.new(name: 'Drank mogelijk', description: 'Kan er drank geserveerd worden?', data_type: SeedHelper.data_type(:boolean), index: 3)
  shape_property = EntityTypeProperty.new(name: 'Vorm', description: 'De vorm van de ruimte', data_type: SeedHelper.data_type(:enum), index: 4, options_attributes: { 0 => { name: 'Vierkant', index: 0 }, 1 => { name: 'Rechthoekig', index: 1 }, 2 => { name: 'Langwerpig', index: 2 }, 3 => { name: 'Anders', index: 3 } })

  # Create entity types of Maldensteijn
  properties = [people_property.dup, seats_property.dup, area_property.dup]
  foyer = EntityType.create!(organisation: maldensteijn, name: 'Foyer', description: 'Open ruimte met een bar en luxe zitplaatsen.', properties: properties)
  foyer.reserve_periods.create(period_unit: TimeUnit.find_by(key: :hour), price: 100)

  properties = [people_property.dup, area_property.dup.set(index: 1), drinks_property.dup.set(index: 2), shape_property.deep_clone(include: :options).set(index: 3)]
  zaal = EntityType.create!(organisation: maldensteijn, name: 'Zaal', description: 'Grote ruimte voor diverse doeleinden.', properties: properties)
  zaal.reserve_periods.create(period_unit: TimeUnit.find_by(key: :half_hour), price: 30)
  zaal.reserve_periods.create(period_unit: TimeUnit.find_by(key: :hour), price: 50)

  properties = [people_property.dup, seats_property.dup, area_property.dup.set(default_value: 20), drinks_property.dup.set(default_value: true), shape_property.deep_clone(include: :options).tap { |p| p.options.detect { |o| o.name == 'Rechthoekig' }.default = true }]
  kantoorruimte = EntityType.create!(organisation: maldensteijn, name: 'Kantoorruimte', description: 'Grote ruimte voor vergaderingen en bijeenkomsten met koffie.', properties: properties)
  kantoorruimte.reserve_periods.create(period_unit: TimeUnit.find_by(key: :hour), price: 50)

  properties = [seats_property.dup.set(index: 0)]
  theaterzaal = EntityType.create!(organisation: maldensteijn, name: 'Theaterzaal', description: 'Grote theaterzaal met tribune.', properties: properties)
  theaterzaal.reserve_periods.create(period_amount: 6, period_unit: TimeUnit.find_by(key: :hour), price: 5000)

  # Create entities of Maldensteijn
  entity = Entity.new(organisation: maldensteijn, entity_type: foyer, name: 'Bovenfoyer', description: 'Foyer op de eerste verdieping.')
  entity.set_properties(10, 5, 17.5)
  entity.save!
  entity = Entity.new(organisation: maldensteijn, entity_type: foyer, name: 'Grote foyer', description: 'Grote foyer in het midden van het gebouw.')
  entity.set_properties(30, 20, 35)
  entity.save!

  entity = Entity.new(organisation: maldensteijn, entity_type: zaal, name: '0.4', description: '')
  entity.set_properties(5, 15)
  entity.save!
  entity = Entity.new(organisation: maldensteijn, entity_type: zaal, name: '0.10', description: '')
  entity.set_properties(8, 25)
  entity.save!
  entity = Entity.new(organisation: maldensteijn, entity_type: zaal, name: '0.11', description: '')
  entity.set_properties(4, 12.5)
  entity.stickies.build(organisation: maldensteijn, user: david_user, sticky_text: 'De lamp is stuk!')
  entity.save!
  entity = Entity.new(organisation: maldensteijn, entity_type: zaal, name: '1.7', description: '')
  entity.set_properties(8, 25, false, 'Anders')
  entity.save!
  entity = Entity.new(organisation: maldensteijn, entity_type: zaal, name: '1.8', description: '')
  entity.set_properties(10, 40, true)
  entity.stickies.build(organisation: maldensteijn, user: ard_user, sticky_text: 'Deur sluit niet goed...')
  entity.save!
  entity = Entity.new(organisation: maldensteijn, entity_type: zaal, name: '1.9', description: '')
  entity.set_properties(6, 20, true, 'Vierkant')
  entity.save!

  entity = Entity.new(organisation: maldensteijn, entity_type: kantoorruimte, name: 'CJG', description: 'Ruimte op de eerste verdieping die standaard verhuurd is aan CJG.')
  entity.set_properties(8, 8, 17.5)
  entity.stickies.build(organisation: maldensteijn, user: christiaan_user, sticky_text: 'Beamer altijd in deze ruimte laten staan. Heeft CJG nodig!')
  entity.save!
  entity = Entity.new(organisation: maldensteijn, entity_type: kantoorruimte, name: '1.10', description: '')
  entity.set_properties(12, 12, 23.6, true, 'Langwerpig')
  entity.save!

  entity = Entity.new(organisation: maldensteijn, entity_type: theaterzaal, name: 'Theaterzaal', description: 'Grote theaterzaal voor voorstellingen.')
  entity.set_properties(150)
  entity.stickies.build(organisation: maldensteijn, user: christiaan_user, sticky_text: 'Er zit een scheur in het gordijn die zo snel mogelijk hersteld moet worden')
  entity.save!

  # Create an info screen
  info_screen = InfoScreen.create!(organisation: maldensteijn, name: 'Entree', public: true)
  # TODO add active entities and entity types to this info screen.

  # Create organisation clients
  OrganisationClient.find_by!(organisation: SeedHelper.organisation('IADA'), email: 'christiaanthijssen@iada.nl').dup.set(organisation: maldensteijn).save!
  SeedHelper.create_organisation_clients(maldensteijn, 5)

  # Create reserverations
  # SeedHelper.create_reservations(maldensteijn, 20) # TODO fix this so it takes the reserve periods into account

  # Create some stickies
  SeedHelper.create_stickies(maldensteijn.organisation_clients, 0.5)
  SeedHelper.create_stickies(maldensteijn.reservations, 1)
end
