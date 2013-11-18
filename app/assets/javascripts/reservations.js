APP.reservations = {
    'new': function() {
      APP.reservations.organisationClientDropdown();
      APP.organisation_clients.addAddressPickerToForm();
      APP.reservations.bindSelectClientRadioButtons();
    },
    edit: function() {
      APP.reservations.organisationClientDropdown();
      APP.organisation_clients.addAddressPickerToForm();
      APP.reservations.bindSelectClientRadioButtons();
    },
    create: function() {
      APP.reservations.organisationClientDropdown();
      APP.organisation_clients.addAddressPickerToForm();
      APP.reservations.bindSelectClientRadioButtons();
    },
    bindSelectClientRadioButtons: function() {
      $(':radio[name="organisation_client_type"]').on('change', function() {
        if($(this).is(':checked')) {
          if($(this).val() == 'new') {
            $('div.existing_organisation_client').hide();
            $('div.new_organisation_client').show();
            $('#addresspicker').addresspicker("updatePosition");
            google.maps.event.trigger($('#addresspicker').addresspicker('getMap'), 'resize');
            $('#addresspicker').addresspicker("reloadPosition");
          } else if($(this).val() == 'existing') {
            $('div.new_organisation_client').hide();
            $('div.existing_organisation_client').show();
          }
        }
      });
      $(':radio[name="organisation_client_type"]').trigger('change');

      // Also perform onchange on radio buttons when client section is opened, for some reason only works with timeout
      $('div.organisation_client h4.collapse').on('click', function() {
        setTimeout(function(){$(':radio[name="organisation_client_type"]').trigger('change')}, 100);
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
