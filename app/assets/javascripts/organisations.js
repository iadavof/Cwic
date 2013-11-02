APP.organisations = {
	edit: function() {
		APP.organisations.add_address_picker_to_form();
	},
	new: function() {
		APP.organisations.add_address_picker_to_form();
	},
	add_address_picker_to_form: function() {
  		var addresspickerMap = $('#address-picker').addresspicker({
		  	reverseGeocode: true,
		  	autocomplete: 'default',
      		regionBias: $('body').data('current-locale'),
		  	mapOptions: {
            	zoom: 6,
            	center: new google.maps.LatLng(52.5, 5.75),
		  	},
		  	elements: {
		      map: '#address-picker-map',
		      route: '#organisation_route',
		      street_number: '#organisation_street_number',
		      locality: '#organisation_locality',
		      administrative_area_level_2: '#organisation_administrative_area_level_2',
		      administrative_area_level_1: '#organisation_administrative_area_level_1',
		      postal_code: '#organisation_postal_code',
		      country: '#organisation_country',
		      lat: '#organisation_lat',
		      lng: '#organisation_lng',
		      type: '#organisation_address_type'
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
  },
}