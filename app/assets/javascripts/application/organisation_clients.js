APP.organisation_clients = {
  show: function() {
    var organisation_client_id = $('#organisation_client_contacts').data('organisationClientId');

    new CwicContactList({
      container: 'organisation_client_contacts',
      backend_url: Routes.organisation_organisation_client_organisation_client_contacts_path(current_organisation, organisation_client_id)
    });
  },
  _form: function() {
    APP.organisation_clients.bindBusinessPrivateToggle();
    var form = $('form.new_organisation_client, form.edit_organisation_client');
    form.find('.contact-wrapper').each(function () { APP.organisation_clients.initContactWrapper($(this)); });
    $(document).on('nested:fieldAdded:contacts', function(event) { APP.organisation_clients.initContactWrapper(event.field); });
  },
  afterGoogleMapsLoaded: function() {
    var addresspickerMap = $('#addresspicker').addresspicker({
      autocomplete: 'default',
      regionBias: $('body').data('current-locale'),
      elements: {
        route: '.addresspicker-route',
        street_number: '.addresspicker-street-number',
        locality: '.addresspicker-locality',
        administrative_area_level_2: '.addresspicker-administrative-area-level-2',
        administrative_area_level_1: '.addresspicker-administrative-area-level-1',
        postal_code: '.addresspicker-postal-code',
        country: '.addresspicker-country'
      }
    });

    $('div.auto-address-fields').on('click', 'a#edit-auto-address-fields', function(e) {
      e.preventDefault();
      $(this).parents('div.auto-address-fields').find('input').removeAttr('readonly');
      return false;
    });
  },
  bindBusinessPrivateToggle: function() {
    var field = $('.business-client-toggle');
    field.on('change', function() {
      APP.organisation_clients.toggleBusinessFields(field.is(':checked'));
    });
    APP.organisation_clients.toggleBusinessFields(field.is(':checked'));
  },
  toggleBusinessFields: function(show) {
    $('.business-client').toggle(show);
    $('.private-client').toggle(!show);
  },
  initContactWrapper: function(contactWrapper) {
    APP.global.nested_objects.initWrapper(contactWrapper);
    contactWrapper.find('.icon-ok').off('click').on('click', function() { APP.organisation_clients.finishContactWrapper(contactWrapper); });
  },
  finishContactWrapper: function(contactWrapper) {
    var instance_name = contactWrapper.find('.form [data-field="last_name"]').val() + ', ' + contactWrapper.find('.form [data-field="first_name"]').val() + ' ' + contactWrapper.find('.form [data-field="infix"]').val();
    contactWrapper.find('.view [data-field="instance_name"]').text(instance_name);
    APP.global.nested_objects.finishWrapper(contactWrapper);
  }
}
