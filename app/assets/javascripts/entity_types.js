APP.entity_types = {
  init: function() {
    APP.entity_types.initIconSelector();
    $('form.new_entity_type, form.edit_entity_type')
      .submit(function () { APP.entity_types.parseFormattedDefaultValues($(this)); APP.entity_types.updateIndexes($(this)); })
      .find('.property-type-wrapper').each(function () { APP.entity_types.initializePropertyTypeWrapper($(this)); });
    $('#property-types').sortable({ placeholder: 'ui-state-highlight', handle: '.handle' });
    $(document).on('nested:fieldAdded:property_types', function(event) { APP.entity_types.initializePropertyTypeWrapper(event.field); });
    $(document).on('nested:fieldAdded:property_type_options', function(event) { APP.entity_types.initializePropertyTypeOptionWrapper(event.field); });
  },
  initIconSelector: function() {
    $(".field.icon-select").on('click', 'label', function() {
      $(".field.icon-select label").removeClass('active');
        $(this).addClass('active');
    });
  },
  initializePropertyTypeWrapper: function(propertyTypeWrapper) {
    // Initialize field actions
    var dataTypeField = propertyTypeWrapper.find('select[data-field="data-type"]')
    dataTypeField.change(function () { APP.entity_types.dataTypeChanged(propertyTypeWrapper); });
    propertyTypeWrapper.find('.property-type-options .clear-default-link').click(function() { APP.entity_types.optionsDefaultUncheckAll(propertyTypeWrapper); });
    propertyTypeWrapper.find('.icon-edit').click(function() { APP.entity_types.editPropertyTypeWrapper(propertyTypeWrapper) });
    propertyTypeWrapper.find('.icon-ok').click(function() { APP.entity_types.donePropertyTypeWrapper(propertyTypeWrapper) });

    // Make the options sortable
    propertyTypeWrapper.find('.property-type-options .target').sortable({ placeholder: 'ui-state-highlight', handle: '.option-handle' });

    // Initialize data type specific fields
    if(dataTypeField.val()) {
      this.dataTypeChanged(propertyTypeWrapper);
      this.setFormattedDefaultValue(propertyTypeWrapper);
    }

    // If the property is not valid, then show form immediately. New properties are also not valid by default.
    if(propertyTypeWrapper.attr('data-valid') == 'false') {
      this.editPropertyTypeWrapper(propertyTypeWrapper);
    }
  },
  editPropertyTypeWrapper: function(propertyTypeWrapper) {
    propertyTypeWrapper.find('.view').hide();
    propertyTypeWrapper.find('.form').show();
  },
  donePropertyTypeWrapper: function(propertyTypeWrapper) {
    // Copy all data from input fields to corresponding containers in view
    var dataType = propertyTypeWrapper.find('select[data-field="data-type"]').find(':selected').data('key');
    /*propertyTypeWrapper.find('.form .field input, .form .field textarea, .form .field select').each(function () {
      if($(this).attr('data-field')) {
        if($(this).is('select')) {
          // We are dealing with a checkbox field
          var value = ($(this).val() ? $(this).find(':selected').text() : '');
        } else if($(this).is('input') && $(this).attr('type') == 'checkbox') {
          // We are dealing with a checkbox field
          var value = $(this).is(':checked') ? 'Ja' : 'Nee'; // XXX TODO internationalization
        } else {
          // We are dealing with a normal field
          var value = $(this).val();
        }
        propertyTypeWrapper.find('.view [data-field="' + $(this).attr('data-field') + '"]').html(format_text(value));
      }
    });*/
    propertyTypeWrapper.find('.view [data-field]').each(function () {
      var input = propertyTypeWrapper.find('.form [data-field="' + $(this).attr('data-field') + '"]');
      if(input) {
        if(input.is('select')) {
          // We are dealing with a checkbox field
          var value = (input.val() ? input.find(':selected').text() : '');
        } else if(input.is('input') && input.attr('type') == 'checkbox') {
          // We are dealing with a checkbox field
          var value = input.is(':checked') ? 'Ja' : 'Nee'; // XXX TODO internationalization
        } else {
          // We are dealing with a normal field
          var value = input.val();
        }
      } else {
        var value = '';
      }
      $(this).html(format_text(value));
    });
    if(dataType == 'enum' || dataType == 'set') {
      // We have options, copy them as well
      var options = [];
      var def = [];
      propertyTypeWrapper.find('.property-type-option-wrapper:visible').each(function(index) {
        var name = $(this).find('.name-field').val();
        options.push(name);
        if($(this).find('.default-field').is(':checked')) {
          def.push(name);
        }
      });
      propertyTypeWrapper.find('.view [data-field="property-type-options"]').html(format_text(array_to_sentence(options)));
      propertyTypeWrapper.find('.view [data-field="default-value"]').html(format_text(array_to_sentence(def)));
    }
    propertyTypeWrapper.find('.form').hide();
    propertyTypeWrapper.find('.view').show();
  },
  dataTypeChanged: function(propertyTypeWrapper) {
    // Determine the selected data type
    var dataType = propertyTypeWrapper.find('select[data-field="data-type"]').find(':selected').data('key')
    var requiredWrapper = propertyTypeWrapper.find('.required');
    var defaultValueWrapper = propertyTypeWrapper.find('.default-value');
    var defaultValueFormattedFieldContainer = defaultValueWrapper.find('.default-value-formatted-field');
    var options = propertyTypeWrapper.find('.property-type-options');

    // Reset data type specific fields
    options.hide();
    requiredWrapper.show(); // The required field is enabled by default. It is only disabled for the boolean data type.
    defaultValueWrapper.hide();
    defaultValueFormattedFieldContainer.empty();

    if(!dataType) {
      return;
    }

    // Rebuild/show data type specific fields
    switch(dataType) {
      case 'text':
        $('<textarea data-field="default-value"></textarea>').appendTo(defaultValueFormattedFieldContainer);
        defaultValueWrapper.show();
        break;
      case 'boolean':
        requiredWrapper.hide();
        $('<input type="checkbox" value="1" data-field="default-value" />').appendTo(defaultValueFormattedFieldContainer);
        defaultValueWrapper.show();
        break;
      case 'enum':
      case 'set':
        options.find('.property-type-option-wrapper').each(function () { APP.entity_types.initializePropertyTypeOptionWrapper($(this)); });
        if(options.find('.target').children().length == 0) {
          options.find('.add_nested_fields').click(); // Make sure there is already one row added (we always want to add at least one option, and else it looks ugly)
        }
        options.show();
        break;
      case 'string':
      case 'integer':
      case 'decimal':
      default:
        $('<input type="text" data-field="default-value" />').appendTo(defaultValueFormattedFieldContainer);
        defaultValueWrapper.show();
        break;
    }
  },
  parseFormattedDefaultValues: function(form) {
    $(form).find('.property-type-wrapper').each(function () {
      APP.entity_types.parseFormattedDefaultValue($(this));
    });
  },
  parseFormattedDefaultValue: function(propertyTypeWrapper) {
    formattedField = propertyTypeWrapper.find('.default-value-formatted-field').children(':first');
    field = propertyTypeWrapper.find('.default-value-parsed-field');
    if(formattedField.attr('type') == 'checkbox') {
      field.val(formattedField.is(':checked') ? '1' : '0');
    } else {
      field.val(formattedField.val());
    }
  },
  setFormattedDefaultValue: function(propertyTypeWrapper) {
    formattedField = propertyTypeWrapper.find('.default-value-formatted-field').children(':first');
    field = propertyTypeWrapper.find('.default-value-parsed-field');
    if(formattedField.attr('type') == 'checkbox') {
      formattedField.prop('checked', (field.val() == 'true'));
    } else {
      formattedField.val(field.val());
    }
  },
  updateIndexes: function(form) {
    $(form).find('.property-type-wrapper').each(function(index) {
      $(this).find('.index-field').val(index);
      $(this).find('.property-type-option-wrapper').each(function(index) {
        $(this).find('.index-field').val(index);
      });
    });
  },
  initializePropertyTypeOptionWrapper: function(propertyTypeOptionWrapper) {
    var propertyTypeWrapper = propertyTypeOptionWrapper.closest('.property-type-wrapper');

    // Swap the newly created field to the right spot
    propertyTypeWrapper.find('.property-type-options .target').append(propertyTypeOptionWrapper);

    var dataType = propertyTypeWrapper.find('select[data-field="data-type"]').find(':selected').data('key');
    if(dataType == 'set') {
      // Set: transform fields to check boxes.
      propertyTypeOptionWrapper.find('.default-field')
        .attr('type', 'checkbox')
        .off('click');
    } else {
      // Enum: transform fields to radio buttons and make sure there can only be one selected at the same time.
      propertyTypeOptionWrapper.find('.default-field')
        .attr('type', 'radio')
        .click(function() { APP.entity_types.optionsDefaultUncheckOthers($(this)); });

      // Check if there are not already two or more items default
      var checkedDefaultFields = propertyTypeWrapper.find('.default-field:checked');
      if(checkedDefaultFields.size() > 1) {
        // There were already two or more items selected (this could happen when we change from set to enum): uncheck all items.
        checkedDefaultFields.prop('checked', false);
      }
    }
  },
  initializePropertyTypeOptionClearLink: function() {
    // Add the action to the clear button
    propertyTypeOptionWrapper.find('.default-field')
        .attr('type', 'radio')
        .click(function() { APP.entity_types.optionsDefaultUncheckOthers($(this)); });
  },
  optionsDefaultUncheckAll: function(propertyTypeWrapper) {
    // Uncheck all default checkboxes/radio buttons.
    propertyTypeWrapper.find('.default-field').prop('checked', false);
  },
  optionsDefaultUncheckOthers: function(field) {
    // Uncheck all other default radio buttons.
    field.closest('.property-type-options').find('.default-field').prop('checked', false);
    // Check this radio button
    field.prop('checked', true);
  }
};