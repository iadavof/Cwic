APP.entity_types = {
  show: function() {
    $('div.entity-images-container').magnificPopup({ delegate: 'a', type: 'image',  gallery: { enabled: true } });
  },
  _form: function() {
    var form = $('form.new_entity_type, form.edit_entity_type');
    form.submit(function () { APP.entity_types.parseFormattedDefaultValues($(this)); APP.entity_types.updateIndexes($(this)); })
    this.initIconSelector();

    form.find('.property-wrapper').each(function () { APP.entity_types.initPropertyWrapper($(this)); })
    $(document).on('nested:fieldAdded:properties', function(event) { APP.entity_types.initPropertyWrapper(event.field); });
    $('#entity-type-properties').sortable({ placeholder: 'ui-state-highlight', handle: '.sort-handle' });

    form.find('.option-wrapper').each(function () { APP.global.nested_objects.initWrapper($(this)); });
    $(document).on('nested:fieldAdded:options', function(event) { APP.entity_types.onNestedFieldAddedOptions(event.field); });
    $('#entity-type-options').sortable({ placeholder: 'ui-state-highlight', handle: '.sort-handle' });

    APP.entity_types.initReservationStatusSort();
    form.find('.reservation-status-wrapper').each(function () { APP.entity_types.initReservationStatusWrapper($(this)); });
    $(document).on('nested:fieldAdded:reservation_statuses', function(event) { APP.entity_types.initReservationStatusWrapper(event.field); });
  },
  initReservationStatusSort: function() {
    $('ul#entity-type-reservation-statuses').sortable({
      placeholder: "ui-state-highlight",
      handle: "div.sort-handle",
    });
  },
  initReservationStatusWrapper: function(reservationStatusWrapper) {
    reservationStatusWrapper.find('.reservation_status_color').minicolors();
  },
  initIconSelector: function() {
    $(".field-icon-select").on('click', 'label', function() {
      $(".field-icon-select label").removeClass('active');
        $(this).addClass('active');
    });
  },
  onNestedFieldAddedOptions: function(field) {
    if(field.hasClass('property-option-wrapper')) {
      this.initPropertyOptionWrapper(field);
    } else {
      APP.global.nested_objects.initWrapper(field);
    }
  },
  initPropertyWrapper: function(propertyWrapper) {
    // Initialize field actions
    var dataTypeField = propertyWrapper.find('select[data-field="data-type"]')
    dataTypeField.change(function () { APP.entity_types.dataTypeChanged(propertyWrapper); });
    propertyWrapper.find('.property-options .clear-default-link').click(function() { APP.entity_types.propertyOptionDefaultUncheckAll(propertyWrapper); });

    // Make the options sortable
    propertyWrapper.find('.property-options .target').sortable({ placeholder: 'ui-state-highlight', handle: '.option-sort-handle' });

    // Initialize data type specific fields
    if(dataTypeField.val()) {
      this.dataTypeChanged(propertyWrapper);
      this.setFormattedDefaultValue(propertyWrapper);
    }

    APP.global.nested_objects.initWrapper(propertyWrapper);
    propertyWrapper.find('.icon-ok').unbind('click').click(function() { APP.entity_types.finishPropertyWrapper(propertyWrapper) });
  },
  finishPropertyWrapper: function(propertyWrapper) {
    APP.global.nested_objects.finishWrapper(propertyWrapper);
    var dataType = propertyWrapper.find('select[data-field="data-type"]').find(':selected').data('key');
    if(dataType == 'enum' || dataType == 'set') {
      // We have options, copy them as well
      var options = [];
      var defaultValues = [];
      propertyWrapper.find('.property-option-wrapper').filter(function() { return $(this).css('display') != 'none'; }).each(function(index) {
        var name = $(this).find('.name-field').val();
        options.push(name);
        if($(this).find('.default-field').is(':checked')) {
          defaultValues.push(name);
        }
      });
      propertyWrapper.find('.view [data-field="property-options"]').html(APP.util.formatText(APP.util.arrayToSentence(options)));
      propertyWrapper.find('.view [data-field="default-value"]').html(APP.util.formatText(APP.util.arrayToSentence(defaultValues)));
    }
  },
  dataTypeChanged: function(propertyWrapper) {
    // Determine the selected data type
    var dataType = propertyWrapper.find('select[data-field="data-type"]').find(':selected').data('key')
    var requiredWrapper = propertyWrapper.find('.field.required');
    var defaultValueWrapper = propertyWrapper.find('.field.default-value');
    var defaultValueFormattedFieldContainer = defaultValueWrapper.find('.default-value-formatted-field');
    var options = propertyWrapper.find('.property-options');

    // Reset data type specific fields
    options.hide();
    requiredWrapper.show(); // The required field is enabled by default. It is only disabled for the boolean data type.
    defaultValueWrapper.hide();
    defaultValueFormattedFieldContainer.empty();

    if(!dataType) {
      return;
    }

    // Rebuild/show data type specific fields
    var defaultValueFormattedField = null;
    switch(dataType) {
      case 'enum':
      case 'set':
        options.find('.property-option-wrapper').each(function () { APP.entity_types.initPropertyOptionWrapper($(this)); });
        if(options.find('.target').children().length == 0) {
          options.find('.add_nested_fields').click(); // Make sure there is already one row added (we always want to add at least one option, and else it looks ugly)
        }
        options.show();
        break;
      case 'text':
        defaultValueFormattedField = $('<textarea data-field="default-value"></textarea>');
        break;
      case 'boolean':
        requiredWrapper.hide();
        defaultValueFormattedField = $('<input type="checkbox" value="1" data-field="default-value" />');
        break;
      case 'string':
      case 'integer':
      case 'decimal':
      default:
        defaultValueFormattedField = $('<input type="text" data-field="default-value" />');
        break;
    }

    if(defaultValueFormattedField) {
      defaultValueFormattedField.data('field', 'default-value').appendTo(defaultValueFormattedFieldContainer).cwicControl();
      defaultValueWrapper.show();
    }
  },
  parseFormattedDefaultValues: function(form) {
    $(form).find('.property-wrapper').each(function () {
      APP.entity_types.parseFormattedDefaultValue($(this));
    });
  },
  parseFormattedDefaultValue: function(propertyWrapper) {
    formattedField = propertyWrapper.find('.default-value-formatted-field').children(':first');
    field = propertyWrapper.find('.default-value-parsed-field');
    if(formattedField.attr('type') == 'checkbox') {
      field.val(formattedField.is(':checked') ? '1' : '0');
    } else {
      field.val(formattedField.val());
    }
  },
  setFormattedDefaultValue: function(propertyWrapper) {
    formattedField = propertyWrapper.find('.default-value-formatted-field').children(':first');
    field = propertyWrapper.find('.default-value-parsed-field');
    if(formattedField.attr('type') == 'checkbox') {
      formattedField.prop('checked', (field.val() == 'true'));
    } else {
      formattedField.val(field.val());
    }
  },
  initPropertyOptionWrapper: function(propertyOptionWrapper) {
    var propertyWrapper = propertyOptionWrapper.closest('.property-wrapper');

    // Swap the newly created field to the right spot
    propertyWrapper.find('.property-options .target').append(propertyOptionWrapper);

    var dataType = propertyWrapper.find('select[data-field="data-type"]').find(':selected').data('key');
    if(dataType == 'set') {
      // Set: transform fields to check boxes.
      propertyOptionWrapper.find('.default-field').cwicControl('destroy');
      propertyOptionWrapper.find('.default-field')
        .attr('type', 'checkbox')
        .off('change')
        .cwicControl();
    } else {
      // Enum: transform fields to radio buttons and make sure there can only be one selected at the same time.
      propertyOptionWrapper.find('.default-field').cwicControl('destroy');
      propertyOptionWrapper.find('.default-field')
        .attr('type', 'radio')
        .change(function() { APP.entity_types.propertyOptionDefaultUncheckOthers($(this)); })
        .cwicControl();

      // Check if there are not already two or more items default
      var checkedDefaultFields = propertyWrapper.find('.default-field:checked');
      if(checkedDefaultFields.size() > 1) {
        // There were already two or more items selected (this could happen when we change from set to enum): uncheck all items.
        checkedDefaultFields.prop('checked', false).trigger('change.cwicControl');
      }
    }
  },
  initPropertyOptionClearLink: function() {
    // Add the action to the clear button
    propertyOptionWrapper.find('.default-field')
        .attr('type', 'radio')
        .click(function() { APP.entity_types.propertyOptionDefaultUncheckOthers($(this)); });
  },
  propertyOptionDefaultUncheckAll: function(propertyWrapper) {
    // Uncheck all default checkboxes/radio buttons.
    propertyWrapper.find('.default-field').prop('checked', false).trigger('change.cwicControl');;
  },
  propertyOptionDefaultUncheckOthers: function(field) {
    if(field.prop('checked')) {
      // Uncheck all other default radio buttons.
      field.closest('.property-options').find('.default-field').prop('checked', false).trigger('change.cwicControl');;
      // Check this radio button
      field.prop('checked', true).trigger('change.cwicControl');
    }
  },
  updateIndexes: function(form) {
    $(form).find('.property-wrapper').each(function(index) {
      $(this).find('.index-field').val(index);
      $(this).find('.property-option-wrapper').each(function(index) {
        $(this).find('.index-field').val(index);
      });
    });
    $(form).find('.option-wrapper, .reservation-status-wrapper').each(function(index) {
      $(this).find('.index-field').val(index);
    });
  }
};
