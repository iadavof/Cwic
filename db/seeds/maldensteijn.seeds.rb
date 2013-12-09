u1 = User.where('first_name = :fname AND last_name = :lname', fname: 'Admin', lname: 'IADA').first;
o1 = Organisation.create!(name: 'Maldensteijn', route: 'Kerkplein', street_number: '8a', administrative_area_level_1: 'Gelderland', administrative_area_level_2: 'Heumen', postal_code: '6581 AC', locality: 'Malden', country: 'Netherlands', lat: 51.7808067, lng: 5.850443799999994)
ou1 = OrganisationUser.create!(organisation: o1, user: u1, organisation_role: OrganisationRole.first)

# Create entity types of Maldensteijn
et1 = EntityType.new(organisation: o1, name: 'Foyer', description: 'Open ruimte met een bar en luxe zitplaatsen.')
et1.add_default_entity_type_reservation_statuses
et1.save!
et2 = EntityType.new(organisation: o1, name: 'Zaal', description: 'Grote ruimte voor vergaderingen en bijeenkomsten met koffie.')
et2.add_default_entity_type_reservation_statuses
et2.save!
et3 = EntityType.new(organisation: o1, name: 'Kantoorruimte', description: 'Grote ruimte voor vergaderingen en bijeenkomsten met koffie.')
et3.add_default_entity_type_reservation_statuses
et3.save!
et4 = EntityType.new(organisation: o1, name: 'Theaterzaal', description: 'Grote theaterzaal met tribune.')
et4.add_default_entity_type_reservation_statuses
et4.save!

# Create entities of Maldensteijn
Entity.create!(organisation: o1, entity_type: et1, name: 'Bovenfoyer', description: 'Foyer op de eerste verdieping.')
Entity.create!(organisation: o1, entity_type: et1, name: 'Grote foyer', description: 'Grote foyer in het midden van het gebouw.')

Entity.create!(organisation: o1, entity_type: et2, name: '0.4', description: '')
Entity.create!(organisation: o1, entity_type: et2, name: '0.10', description: '')
Entity.create!(organisation: o1, entity_type: et2, name: '0.11', description: '')
Entity.create!(organisation: o1, entity_type: et2, name: '1.7', description: '')
Entity.create!(organisation: o1, entity_type: et2, name: '1.8', description: '')
Entity.create!(organisation: o1, entity_type: et2, name: '1.9', description: '')

Entity.create!(organisation: o1, entity_type: et3, name: 'CJG', description: 'Ruimte op de eerste verdieping die standaard verhuurd is aan CJG.')
Entity.create!(organisation: o1, entity_type: et3, name: '1.10', description: '')

Entity.create!(organisation: o1, entity_type: et4, name: 'Theaterzaal', description: '')

#Create organisation clients
OrganisationClient.create!(organisation: o1, first_name: 'Christiaan', last_name: 'Thijssen', email: 'christiaanthijssen@iada.nl', route: 'Grote Loef', street_number: '75', administrative_area_level_1: 'Gelderland', administrative_area_level_2: 'Heumen', postal_code: '6581 JE', locality: 'Malden', country: 'Netherlands', lat: 51.7808067, lng: 5.850443799999994)