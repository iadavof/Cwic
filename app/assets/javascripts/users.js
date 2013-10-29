APP.registrations = {
  init: function() {
  	this.add_address_picker_to_form();
  },
  add_address_picker_to_form: function() {
  	var addresspickerMap = $('#address-picker').addresspicker({
		  reverseGeocode: true,
		  autocomplete: 'default',
		  mapOptions: {
            zoom: 6, 
            center: new google.maps.LatLng(52.5, 5.75),
		  },
		  elements: {
		      map: '#address-picker-map',
		      route: '#user_organisations_attributes_0_route',
		      street_number: '#user_organisations_attributes_0_street_number',
		      locality: '#user_organisations_attributes_0_locality',
		      administrative_area_level_2: '#user_organisations_attributes_0_administrative_area_level_2',
		      administrative_area_level_1: '#user_organisations_attributes_0_administrative_area_level_1',
		      postal_code: '#user_organisations_attributes_0_postal_code',
		      country: '#user_organisations_attributes_0_country',
		      lat: '#user_organisations_attributes_0_lat',
		      lng: '#user_organisations_attributes_0_lng',
		      type: '#user_organisations_attributes_0_address_type'
		  },
	});

	var gmarker = addresspickerMap.addresspicker( "marker");
	gmarker.setVisible(true);
	addresspickerMap.addresspicker( "updatePosition");

	$('div.auto-address-fields').on('click', 'a#edit-auto-address-fields', function(e) {
		e.preventDefault();
		$(this).parents('div.auto-address-fields').find('input').removeAttr('readonly');
		return false;
	});
  }
}