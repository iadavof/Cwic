APP.entity_types = {
  init: function() {
    APP.entity_types.initIconSelector();
    $('form.new_entity_type, form.edit_entity_type')
      .submit(function () { APP.entity_types.parseFormattedDefaultValues($(this)); APP.entity_types.updateIndexes($(this)); })
      .find('.entity-type-property-wrapper').each(function () { APP.entity_types.initializeEntityTypePropertyWrapper($(this)); });
    $('#entity-type-properties').sortable({ placeholder: 'ui-state-highlight', handle: '.handle' });
    $(document).on('nested:fieldAdded:properties', function(event) { APP.entity_types.initializeEntityTypePropertyWrapper(event.field); });
    $(document).on('nested:fieldAdded:options', function(event) { APP.entity_types.initializeEntityTypePropertyOptionWrapper(event.field); });
  },
  initIconSelector: function() {
    $(".field.icon-select").on('click', 'label', function() {
      $(".field.icon-select label").removeClass('active');
        $(this).addClass('active');
    });
  },
  initializeEntityTypePropertyWrapper: function(entityTypePropertyWrapper) {
    // Initialize field actions
    var dataTypeField = entityTypePropertyWrapper.find('select[data-field="data-type"]')
    dataTypeField.change(function () { APP.entity_types.dataTypeChanged(entityTypePropertyWrapper); });
    entityTypePropertyWrapper.find('.entity-type-property-options .clear-default-link').click(function() { APP.entity_types.optionsDefaultUncheckAll(entityTypePropertyWrapper); });
    entityTypePropertyWrapper.find('.icon-edit').click(function() { APP.entity_types.editEntityTypePropertyWrapper(entityTypePropertyWrapper) });
    entityTypePropertyWrapper.find('.icon-ok').click(function() { APP.entity_types.doneEntityTypePropertyWrapper(entityTypePropertyWrapper) });

    // Make the options sortable
    entityTypePropertyWrapper.find('.entity-type-property-options .target').sortable({ placeholder: 'ui-state-highlight', handle: '.option-handle' });

    // Initialize data type specific fields
    if(dataTypeField.val()) {
      this.dataTypeChanged(entityTypePropertyWrapper);
      this.setFormattedDefaultValue(entityTypePropertyWrapper);
    }

    // If the property is not valid, then show form immediately. New properties are also not valid by default.
    if(entityTypePropertyWrapper.attr('data-valid') == 'false') {
      this.editEntityTypePropertyWrapper(entityTypePropertyWrapper);
    }
  },
  editEntityTypePropertyWrapper: function(entityTypePropertyWrapper) {
    entityTypePropertyWrapper.find('.view').hide();
    entityTypePropertyWrapper.find('.form').show();
  },
  doneEntityTypePropertyWrapper: function(entityTypePropertyWrapper) {
    // Copy all data from input fields to corresponding containers in view
    var dataType = entityTypePropertyWrapper.find('select[data-field="data-type"]').find(':selected').data('key');
    /*entityTypePropertyWrapper.find('.form .field input, .form .field textarea, .form .field select').each(function () {
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
        entityTypePropertyWrapper.find('.view [data-field="' + $(this).attr('data-field') + '"]').html(format_text(value));
      }
    });*/
    entityTypePropertyWrapper.find('.view [data-field]').each(function () {
      var input = entityTypePropertyWrapper.find('.form [data-field="' + $(this).attr('data-field') + '"]');
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
      entityTypePropertyWrapper.find('.entity-type-property-option-wrapper:visible').each(function(index) {
        var name = $(this).find('.name-field').val();
        options.push(name);
        if($(this).find('.default-field').is(':checked')) {
          def.push(name);
        }
      });
      entityTypePropertyWrapper.find('.view [data-field="entity-type-property-options"]').html(format_text(array_to_sentence(options)));
      entityTypePropertyWrapper.find('.view [data-field="default-value"]').html(format_text(array_to_sentence(def)));
    }
    entityTypePropertyWrapper.find('.form').hide();
    entityTypePropertyWrapper.find('.view').show();
  },
  dataTypeChanged: function(entityTypePropertyWrapper) {
    // Determine the selected data type
    var dataType = entityTypePropertyWrapper.find('select[data-field="data-type"]').find(':selected').data('key')
    var requiredWrapper = entityTypePropertyWrapper.find('.required');
    var defaultValueWrapper = entityTypePropertyWrapper.find('.default-value');
    var defaultValueFormattedFieldContainer = defaultValueWrapper.find('.default-value-formatted-field');
    var options = entityTypePropertyWrapper.find('.entity-type-property-options');

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
        options.find('.entity-type-property-option-wrapper').each(function () { APP.entity_types.initializeEntityTypePropertyOptionWrapper($(this)); });
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
    $(form).find('.entity-type-property-wrapper').each(function () {
      APP.entity_types.parseFormattedDefaultValue($(this));
    });
  },
  parseFormattedDefaultValue: function(entityTypePropertyWrapper) {
    formattedField = entityTypePropertyWrapper.find('.default-value-formatted-field').children(':first');
    field = entityTypePropertyWrapper.find('.default-value-parsed-field');
    if(formattedField.attr('type') == 'checkbox') {
      field.val(formattedField.is(':checked') ? '1' : '0');
    } else {
      field.val(formattedField.val());
    }
  },
  setFormattedDefaultValue: function(entityTypePropertyWrapper) {
    formattedField = entityTypePropertyWrapper.find('.default-value-formatted-field').children(':first');
    field = entityTypePropertyWrapper.find('.default-value-parsed-field');
    if(formattedField.attr('type') == 'checkbox') {
      formattedField.prop('checked', (field.val() == 'true'));
    } else {
      formattedField.val(field.val());
    }
  },
  updateIndexes: function(form) {
    $(form).find('.entity-type-property-wrapper').each(function(index) {
      $(this).find('.index-field').val(index);
      $(this).find('.entity-type-property-option-wrapper').each(function(index) {
        $(this).find('.index-field').val(index);
      });
    });
  },
  initializeEntityTypePropertyOptionWrapper: function(entityTypePropertyOptionWrapper) {
    var entityTypePropertyWrapper = entityTypePropertyOptionWrapper.closest('.entity-type-property-wrapper');

    // Swap the newly created field to the right spot
    entityTypePropertyWrapper.find('.entity-type-property-options .target').append(entityTypePropertyOptionWrapper);

    var dataType = entityTypePropertyWrapper.find('select[data-field="data-type"]').find(':selected').data('key');
    if(dataType == 'set') {
      // Set: transform fields to check boxes.
      entityTypePropertyOptionWrapper.find('.default-field')
        .attr('type', 'checkbox')
        .off('click');
    } else {
      // Enum: transform fields to radio buttons and make sure there can only be one selected at the same time.
      entityTypePropertyOptionWrapper.find('.default-field')
        .attr('type', 'radio')
        .click(function() { APP.entity_types.optionsDefaultUncheckOthers($(this)); });

      // Check if there are not already two or more items default
      var checkedDefaultFields = entityTypePropertyWrapper.find('.default-field:checked');
      if(checkedDefaultFields.size() > 1) {
        // There were already two or more items selected (this could happen when we change from set to enum): uncheck all items.
        checkedDefaultFields.prop('checked', false);
      }
    }
  },
  initializeEntityTypePropertyOptionClearLink: function() {
    // Add the action to the clear button
    entityTypePropertyOptionWrapper.find('.default-field')
        .attr('type', 'radio')
        .click(function() { APP.entity_types.optionsDefaultUncheckOthers($(this)); });
  },
  optionsDefaultUncheckAll: function(entityTypePropertyWrapper) {
    // Uncheck all default checkboxes/radio buttons.
    entityTypePropertyWrapper.find('.default-field').prop('checked', false);
  },
  optionsDefaultUncheckOthers: function(field) {
    // Uncheck all other default radio buttons.
    field.closest('.entity-type-property-options').find('.default-field').prop('checked', false);
    // Check this radio button
    field.prop('checked', true);
  }
};