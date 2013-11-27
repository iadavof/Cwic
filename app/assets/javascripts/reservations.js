APP.reservations = {
    'new': function() {
      APP.reservations.organisationClientDropdown();
      APP.organisation_clients.addAddressPickerToForm();
      APP.reservations.bindSelectClientRadioButtons();
    },
    edit: function() {
      APP.reservations.organisationClientDropdown();
      APP.organisation_clients.addAddressPickerToForm();
      // Hide organisation client selection
      $('div.organisation_client_new_existing').hide();
      APP.reservations.bindStatusSelectorControls();
    },
    create: function() {
      APP.reservations.organisationClientDropdown();
      APP.organisation_clients.addAddressPickerToForm();
      APP.reservations.bindSelectClientRadioButtons();
    },
    show: function() {
      APP.reservations.bindStatusSelectorControls();
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
    },
    bindStatusSelectorControls: function() {
      $('div.status-selector').on('click', 'a', function() {
        var new_status_id = $(this).data('status-id');
        var selectorDiv = $(this).parents('div.status-selector');

        selectorDiv.find('a').removeClass('active');
        $(this).addClass('active');

        $.ajax({
          type: 'PATCH',
          url: Routes.organisation_reservations_update_status_path(current_organisation, selectorDiv.data('reservation-id')) + '.json',
          data: {
            status_id: new_status_id,
          }
        }).success(function(response) {
          selectorDiv.find('p.saved-notification').show();
          setTimeout(function() { selectorDiv.find('p.saved-notification').hide(); }, 5000);
        });

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
