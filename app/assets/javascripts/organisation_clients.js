APP.organisation_clients = {
	edit: function() {
		APP.organisation_clients.addAddressPickerToForm();
	},
	'new': function() {
		APP.organisation_clients.addAddressPickerToForm();
	},
	create: function() {
		APP.organisation_clients.addAddressPickerToForm();
	},
	addAddressPickerToForm: function() {
  		var addresspickerMap = $('#address-picker').addresspicker({
		  	reverseGeocode: true,
		  	autocomplete: 'default',
      		regionBias: $('body').data('current-locale'),
		  	mapOptions: {
	            zoom: ($('#organisation_client_lat').val() == '' && $('#organisation_client_lng').val() == '') ? 6 : 15,
            	center: new google.maps.LatLng(52.5, 5.75),
            	scrollwheel: true,
		  	},
		  	elements: {
		      map: '#address-picker-map',
		      route: '#organisation_client_route',
		      street_number: '#organisation_client_street_number',
		      locality: '#organisation_client_locality',
		      administrative_area_level_2: '#organisation_client_administrative_area_level_2',
		      administrative_area_level_1: '#organisation_client_administrative_area_level_1',
		      postal_code: '#organisation_client_postal_code',
		      country: '#organisation_client_country',
		      lat: '#organisation_client_lat',
		      lng: '#organisation_client_lng',
		      type: '#organisation_client_address_type'
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