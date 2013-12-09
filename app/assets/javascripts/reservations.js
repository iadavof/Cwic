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
    index: function() {
      APP.reservations.bindClearFieldButtons();
      APP.reservations.bindOnSubmitMiniSearch();
    },
    bindClearFieldButtons: function() {
      $('div.field-with-clear').on('click', 'span', function(){
        var div = $(this).closest('div.field-with-clear');
        div.find('input').val('');
        div.parents('form').submit();
      });
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
    bindOnSubmitMiniSearch: function() {
      $('form.mini-search.with-date').on('submit.date-domain', function(e) {
        e.preventDefault();
        var form = $(this);
        var domainFrom = form.find('input#date_domain_from');
        var domainTo = form.find('input#date_domain_to');

        // If one of both date fields is empty, submit is ok
        if(domainFrom.val() == '' || domainTo.val() == '') {
          form.off('submit.date-domain');
          form.submit();
          return true;
        }

        var domainFromMoment = moment(domainFrom.datepicker('getDate'));
        var domainToMoment = moment(domainTo.datepicker('getDate'));

        if(domainFromMoment.unix() >= domainToMoment.unix()) {
          if(domainTo.parent().hasClass('field_with_errors')) {
            domainTo.unwrap();
          }
          domainTo.wrap($('<div>', {'class': 'field_with_errors'}));
        } else {
          form.off('submit.date-domain');
          form.submit();
          return true;
        }
        return false;
      });
    },
    bindStatusSelectorControls: function(changedCallback) {
      $('div.status-selector').on('click', 'a', function() {
        var button = $(this);
        var new_status_id = button.data('status-id');
        var selectorDiv = button.parents('div.status-selector');

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

          if(changedCallback != null) {
            changedCallback(button);
          }
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
