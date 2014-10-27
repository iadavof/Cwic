APP.reservations = {
  index: function() {
    APP.reservations.bindOnSubmitMiniSearch();
  },
  show: function() {
    APP.reservations.bindStatusSelectorControls();
  },
  edit: function() {
    APP.reservations.bindStatusSelectorControls();
  },
  multiple: function() {
    APP.reservations.bindSelectEditFields();
  },
  _new_create: function() {
    APP.reservations.bindSelectClientRadioButtons();
    APP.organisation_clients.bindBusinessPrivateToggle();
    APP.reservations.bindReservationRecurrenceControls();
  },
  _form: function() {
    new CwicReservationFormController({
      available_entities_url: Routes.available_organisation_entities_path(current_organisation, { format: 'json' }),
      container: 'reservation-form'
    });
  },
  afterGoogleMapsLoaded: function() {
    APP.organisation_clients.afterGoogleMapsLoaded();
  },
  bindSelectEditFields: function() {
    var fields = $('div.field input, div.field select div.field textarea').on('focus', function(){
      $(this).parents('div.field').find('input.edit_field_checkbox').prop('checked', true).trigger('change');
    });
  },
  bindSelectClientRadioButtons: function() {
    $(':radio[name="organisation_client_type"]').on('change', function() {
      if($(this).is(':checked')) {
        if($(this).val() == 'new') {
          $('div.existing_organisation_client').hide();
          $('div.new_organisation_client').show();
        } else if($(this).val() == 'existing') {
          $('div.new_organisation_client').hide();
          $('div.existing_organisation_client').show();
        }
      }
    });
    $(':radio[name="organisation_client_type"]').trigger('change');
  },
  bindOnSubmitMiniSearch: function() {
    var form = $('form.mini-search.with-date');
    form.find('input[type="submit"]').on('click', APP.reservations.checkDateAndSubmit);
    form.find('input#date_domain_from, input#date_domain_to').on('change', APP.reservations.checkDateAndSubmit);
  },
  checkDateAndSubmit: function(e) {
    if(e) {
      e.preventDefault();
    }
    var form = $(this).closest('form');
    var domainFrom = form.find('input#date_domain_from');
    var domainTo = form.find('input#date_domain_to');

    // If one of both date fields is empty, submit is ok
    if(domainFrom.val() == '' || domainTo.val() == '') {
      form.off('submit');
      form.submit();
      return true;
    }

    var domainFromMoment = moment(domainFrom.datepicker('getDate'));
    var domainToMoment = moment(domainTo.datepicker('getDate'));

    if(domainFromMoment.unix() >= domainToMoment.unix()) {
      APP.util.setFieldErrorState(domainTo, true)
    } else {
      form.off('submit');
      form.submit();
      return true;
    }
    return false;
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
        url: Routes.update_status_organisation_reservation_path(current_organisation, selectorDiv.data('reservation-id')) + '.json',
        data: {
          status_id: new_status_id
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
  showHideWeekdayMonthdaySelectors: function() {
    var value = $(this).find('option:selected').data('key');
    $('div.recurrence_definition_fields div.recurrence_definition_monthly, div.recurrence_definition_fields div.recurrence_definition_weekly').hide();
    if(value == 'week') {
      $('div.recurrence_definition_fields div.recurrence_definition_weekly').show();
    } else if(value == 'month') {
      $('div.recurrence_definition_fields div.recurrence_definition_monthly').show();
    }
  },
  showHideRecurrenceFields: function() {
    if($(this).is(':checked')) {
      $('div.recurrence_definition_fields').show();
      $('input#reservation_reservation_recurrence_definition_attributes_repeating_end_until, input#reservation_reservation_recurrence_definition_attributes_repeating_end_instances').trigger('change');
    } else {
      $('div.recurrence_definition_fields').hide();
    }
  },
  showHideRepeatingEndInstancesOrUntil: function() {
    var value = $(this).val();
    if($(this).is(':checked')) {
      if(value == 'until') {
        $('input#reservation_reservation_recurrence_definition_attributes_repeating_until').show();
        $('input#reservation_reservation_recurrence_definition_attributes_repeating_instances').val('').hide().trigger('change');
      } else if(value == 'instances') {
        $('input#reservation_reservation_recurrence_definition_attributes_repeating_instances').show();
        $('input#reservation_reservation_recurrence_definition_attributes_repeating_until').val('').hide().trigger('change');
      }
    }
  },
  setRepeatingEveryUnitLabel: function() {
    var value = $(this).find('option:selected').data('key');
    $('span.repeating_every_unit').hide();
    if(value == '') {
      return;
    }
    $('span.repeating_every_unit#repeating_every_unit_' + value).show();
  },
  bindReservationRecurrenceControls: function() {
    var repeatingUnitField = $('select#reservation_reservation_recurrence_definition_attributes_repeating_unit_id');
    repeatingUnitField.on('change', APP.reservations.showHideWeekdayMonthdaySelectors);
    repeatingUnitField.on('change', APP.reservations.setRepeatingEveryUnitLabel);
    // call the "on change" function on page load to restore browser cached input selection
    APP.reservations.showHideWeekdayMonthdaySelectors.call(repeatingUnitField);
    APP.reservations.setRepeatingEveryUnitLabel.call(repeatingUnitField);


    $('input[name="reservation[reservation_recurrence_definition_attributes][repeating]"]').on('change', APP.reservations.showHideRecurrenceFields);
    $('input#reservation_reservation_recurrence_definition_attributes_repeating_end_until, input#reservation_reservation_recurrence_definition_attributes_repeating_end_instances').on('change', APP.reservations.showHideRepeatingEndInstancesOrUntil);

    // Binding on click for weekday and monthday selectors
    $('div.repeating_monthdays_selector, div.repeating_weekdays_selector').on('click', 'label', function() {
      label = $(this);
      // Because of the For attribute in the label, the checkbox will change when clicking on the label. We do not need to handle this here.
      label.hasClass('active') ? label.removeClass('active') : label.addClass('active');
    });

    // Setting the values after reload.
    $('input#reservation_reservation_recurrence_definition_attributes_repeating_end_until, input#reservation_reservation_recurrence_definition_attributes_repeating_end_instances').trigger('change');

    if($('input[name="reservation[reservation_recurrence_definition_attributes][repeating]"]').is(':checked')) {
      $('div.recurrence_definition_fields').show();
    }

    $('div.recurrence_definition_fields input[type="checkbox"]').each(function() {
      if($(this).is(':checked')) {
        $("label[for='"+$(this).attr('id')+"']").addClass('active');
      }
    });
  }
};
