APP.reservations = {
    'new': function() {
      APP.reservations.organisationClientDropdown();
      APP.reservations.bindSelectClientRadioButtons();
      APP.reservations.addAddressPickerToForm();
    },
    edit: function() {
      APP.reservations.organisationClientDropdown();
      APP.reservations.bindSelectClientRadioButtons();
      APP.reservations.addAddressPickerToForm();
    },
    create: function() {
      APP.reservations.organisationClientDropdown();
      APP.reservations.bindSelectClientRadioButtons();
      APP.reservations.addAddressPickerToForm();
    },
    bindSelectClientRadioButtons: function() {
      $(':radio[name="organisation_client_type"]').on('change', function() {
        if($(this).is(':checked')) {
          if($(this).val() == 'new') {
            $('div.existing_organisation_client').hide();
            $('div.new_organisation_client').show();
            console.debug($('#address-picker').addresspicker('map'));
            google.maps.event.trigger($('#address-picker').addresspicker('map'), 'resize');
            $('#address-picker').addresspicker("updatePosition");
            $('#address-picker').addresspicker("reloadPosition");
          } else if($(this).val() == 'existing') {
            $('div.new_organisation_client').hide();
            $('div.existing_organisation_client').show();
          }
        }
      });
    },
    addAddressPickerToForm: function() {
      var addresspickerMap = $('#address-picker').addresspicker({
        reverseGeocode: true,
        autocomplete: 'default',
          regionBias: $('body').data('current-locale'),
        mapOptions: {
              zoom: ($('#reservation_organisation_client_attributes_lat').val() == '' && $('#reservation_organisation_client_attributes_lng').val() == '') ? 6 : 15,
              center: new google.maps.LatLng(52.5, 5.75),
              scrollwheel: true,
        },
        elements: {
          map: '#address-picker-map',
          route: '#reservation_organisation_client_attributes_route',
          street_number: '#reservation_organisation_client_attributes_street_number',
          locality: '#reservation_organisation_client_attributes_locality',
          administrative_area_level_2: '#reservation_organisation_client_attributes_administrative_area_level_2',
          administrative_area_level_1: '#reservation_organisation_client_attributes_administrative_area_level_1',
          postal_code: '#reservation_organisation_client_attributes_postal_code',
          country: '#reservation_organisation_client_attributes_country',
          lat: '#reservation_organisation_client_attributes_lat',
          lng: '#reservation_organisation_client_attributes_lng',
          type: '#reservation_organisation_client_attributes_address_type'
        },
      });

      var gmarker = addresspickerMap.addresspicker( "marker");
      gmarker.setVisible(true);
      addresspickerMap.addresspicker("updatePosition");

      $('div.auto-address-fields').on('click', 'a#edit-auto-address-fields', function(e) {
        e.preventDefault();
        $(this).parents('div.auto-address-fields').find('input').removeAttr('readonly');
        return false;
      });
    },
    organisationClientDropdown: function() {
      $('input#organisation_client_select').select2({
        initSelection: function(element, callback) {
            var id = $(element).val();
            var text = $(element).data('prev-selected') || jsLang.reservations.select_client_placeholder;
            return callback({id: id, text: text });
        },
        placeholder: jsLang.reservations.select_client_placeholder,
        minimumInputLength: 1,
        width: 'resolve',
        ajax: {
          url: Routes.organisation_organisation_clients_autocomplete_search_path(current_organisation, { format: 'json' }),
          dataType: 'json',
          quietMillis: 500,
          data: function(term, page) {
            return { q: term, page: page };
          },
          results: function(data, page) {
            return data;
          }
        },
      });
    },
}
