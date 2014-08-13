APP.organisation_clients = {
  show: function() {
    var organisation_client_id = $('#organisation_client_contacts').data('organisationClientId');

    new CwicContactList({
      container: 'organisation_client_contacts',
      backend_url: Routes.organisation_organisation_client_organisation_client_contacts_path(current_organisation, organisation_client_id),
    });
  },
  _form: function() {
    APP.organisation_clients.bindBusinessPrivateToggle();
  },
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
  },
  bindBusinessPrivateToggle: function() {
    var field = $('#organisation_client_business_client');
    field.on('change', function() {
      APP.organisation_clients.toggleBusinessFields($(this).is(':checked'));
    });
    APP.organisation_clients.toggleBusinessFields.call(field);
  },
  toggleBusinessFields: function(show) {
    $('.business-client').toggle(show);
    $('.private-client').toggle(!show);
  }
}
