APP.entity_types = {
  init: function() {
    $('#entity_type_color').minicolors();
    $('form.new_entity_type, form.edit_entity_type')
      .submit(function () { APP.entity_types.parseFormattedDefaultValues($(this)); })
      .find('.property-type-wrapper').each(function () { APP.entity_types.initializePropertyTypeWrapper($(this)); });
    $(document).on('nested:fieldAdded:property_types', function(event) { APP.entity_types.initializePropertyTypeWrapper(event.field); });
    $(document).on('nested:fieldAdded:property_type_options', function(event) { APP.entity_types.initializePropertyTypeOptionWrapper(event.field); });
  },
  initializePropertyTypeWrapper: function(propertyTypeWrapper) {
    // Initialize field actions
    var dataTypeField = propertyTypeWrapper.find('.data-type-field');
    dataTypeField.change(function () { APP.entity_types.dataTypeChanged(propertyTypeWrapper); });

    var clearDefaultLink = propertyTypeWrapper.find('.property-type-options-clear-default-link')
    clearDefaultLink.click(function() { APP.entity_types.optionsDefaultUncheckAll(propertyTypeWrapper); });

    // Initialize data type specific fields
    if(dataTypeField.val()) {
      this.dataTypeChanged(propertyTypeWrapper);
      this.setFormattedDefaultValue(propertyTypeWrapper);
    }
  },
  dataTypeChanged: function(propertyTypeWrapper) {
    // Determine the selected data type
    var dataType = propertyTypeWrapper.find('.data-type-field').find(':selected').data('key')
    var requiredWrapper = propertyTypeWrapper.find('.property-type-required-wrapper');
    var defaultValueWrapper = propertyTypeWrapper.find('.property-type-default-value-wrapper');
    var defaultValueFormattedFieldContainer = defaultValueWrapper.find('.property-type-default-value-formatted-field-container');
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
        $('<textarea></textarea>').appendTo(defaultValueFormattedFieldContainer);
        defaultValueWrapper.show();
        break;
      case 'boolean':
        requiredWrapper.hide();
        $('<input type="checkbox" value="1" />').appendTo(defaultValueFormattedFieldContainer);
        defaultValueWrapper.show();
        break;
      case 'enum':
      case 'set':
        options.find('.property-type-option-wrapper').each(function () { APP.entity_types.initializePropertyTypeOptionWrapper($(this)); });
        if(options.find('.property-type-options-target').children().length == 0) {
          options.find('.add_nested_fields').click(); // Make sure there is already one row added (we always want to add at least one option, and else it looks ugly)
        }
        options.show();
        break;
      case 'string':
      case 'integer':
      case 'decimal':
      default:
        $('<input type="text" />').appendTo(defaultValueFormattedFieldContainer);
        defaultValueWrapper.show();
        break;
    }
  },
  initializePropertyTypeOptionClearLink: function() {
    // Add the action to the clear button
    propertyTypeOptionWrapper.find('.property-type-option-default-field')
        .attr('type', 'radio')
        .click(function() { APP.entity_types.optionsDefaultUncheckOthers($(this)); });
  },
  initializePropertyTypeOptionWrapper: function(propertyTypeOptionWrapper) {
    var propertyTypeWrapper = propertyTypeOptionWrapper.closest('.property-type-wrapper');

    // Swap the newly created field to the right spot
    propertyTypeWrapper.find('.property-type-options-target').append(propertyTypeOptionWrapper);

    var dataType = propertyTypeWrapper.find('.data-type-field').find(':selected').data('key');
    if(dataType == 'set') {
      // Set: transform fields to check boxes.
      propertyTypeOptionWrapper.find('.property-type-option-default-field')
        .attr('type', 'checkbox')
        .off('click');
    } else {
      // Enum: transform fields to radio buttons and make sure there can only be one selected at the same time.
      propertyTypeOptionWrapper.find('.property-type-option-default-field')
        .attr('type', 'radio')
        .click(function() { APP.entity_types.optionsDefaultUncheckOthers($(this)); });

      // Check if there are not already two or more items default
      var checkedDefaultFields = propertyTypeWrapper.find('.property-type-option-default-field:checked');
      if(checkedDefaultFields.size() > 1) {
        // There were already two or more items selected (this could happen when we change from set to enum): uncheck all items.
        checkedDefaultFields.prop('checked', false);
      }
    }
  },
  optionsDefaultUncheckAll: function(propertyTypeWrapper) {
    // Uncheck all default checkboxes/radio buttons.
    propertyTypeWrapper.find('.property-type-option-default-field').prop('checked', false);
  },
  optionsDefaultUncheckOthers: function(field) {
    // Uncheck all other default radio buttons.
    field.closest('.property-type-options').find('.property-type-option-default-field').prop('checked', false);
    // Check this radio button
    field.prop('checked', true);
  },
  parseFormattedDefaultValues: function(form) {
    $(form).find('.property-type-wrapper').each(function () {
      APP.entity_types.parseFormattedDefaultValue($(this));
    });
  },
  parseFormattedDefaultValue: function(propertyTypeWrapper) {
    formattedField = propertyTypeWrapper.find('.property-type-default-value-formatted-field-container').children(':first');
    field = propertyTypeWrapper.find('.property-type-default-value-field');
    if(formattedField.attr('type') == 'checkbox') {
      field.val(formattedField.is(':checked') ? '1' : '0');
    } else {
      field.val(formattedField.val());
    }
  },
  setFormattedDefaultValue: function(propertyTypeWrapper) {
    formattedField = propertyTypeWrapper.find('.property-type-default-value-formatted-field-container').children(':first');
    field = propertyTypeWrapper.find('.property-type-default-value-field');
    if(formattedField.attr('type') == 'checkbox') {
      formattedField.prop('checked', (field.val() == 'true'));
    } else {
      formattedField.val(field.val());
    }
  }
};