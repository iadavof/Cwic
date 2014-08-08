APP.organisation_clients = {
	afterGoogleMapsLoaded: function() {
    var addresspickerMap = $('#addresspicker').addresspicker({
      reverseGeocode: true,
      autocomplete: 'default',
      regionBias: $('body').data('current-locale'),
      elements: {
        route: '.addresspicker-route',
        street_number: '.addresspicker-street-number',
        locality: '.addresspicker-locality',
        administrative_area_level_2: '.addresspicker-administrative-area-level-2',
        administrative_area_level_1: '.addresspicker-administrative-area-level-1',
        postal_code: '.addresspicker-postal-code',
        country: '.addresspicker-country',
      },
    });

    $('div.auto-address-fields').on('click', 'a#edit-auto-address-fields', function(e) {
      e.preventDefault();
      $(this).parents('div.auto-address-fields').find('input').removeAttr('readonly');
      return false;
    });
  }
}
