APP.organisations = {
	afterGoogleMapsLoaded: function() {
		$('#addresspicker-map img').remove();

		var addresspickerMap = $('#addresspicker').addresspicker({
	  	reverseGeocode: true,
	  	autocomplete: 'default',
    		regionBias: $('body').data('current-locale'),
	  	mapOptions: {
            zoom: ($('.addresspicker-lat').val() == '' && $('.addresspicker-lng').val() == '') ? 6 : 15,
          	center: new google.maps.LatLng(52.5, 5.75),
          	scrollwheel: true,
          	mapTypeId: google.maps.MapTypeId.ROADMAP,
	  	},
	  	elements: {
	      map: '#addresspicker-map',
	      route: '.addresspicker-route',
	      street_number: '.addresspicker-street-number',
	      locality: '.addresspicker-locality',
	      administrative_area_level_2: '.addresspicker-administrative-area-level-2',
	      administrative_area_level_1: '.addresspicker-administrative-area-level-1',
	      postal_code: '.addresspicker-postal-code',
	      country: '.addresspicker-country',
	      lat: '.addresspicker-lat',
	      lng: '.addresspicker-lng',
	      type: '.addresspicker-address-type'
	  	},
		});

		addresspickerMap.addresspicker( "reloadPosition");
		addresspickerMap.addresspicker( "updatePosition");

		$('div.auto-address-fields').on('click', 'a#edit-auto-address-fields', function(e) {
			e.preventDefault();
			$(this).parents('div.auto-address-fields').find('input').removeAttr('readonly');
			return false;
		});
  },
}
