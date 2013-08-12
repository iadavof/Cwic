APP.entity_types = {
  init: function() {
    $('#entity_type_color').minicolors();
    $('form.new_entity_type, form.edit_entity_type')
      .submit(function () { APP.entity_types.parseFormattedDefaultValues($(this)); })
      .find('.property-type-wrapper').each(function () { APP.entity_types.initializePropertyTypeWrapper($(this)); });
    $(document).on('nested:fieldAdded:property_types', function(event) { APP.entity_types.initializePropertyTypeWrapper(event.field.find('.property-type-wrapper')); });
    $(document).on('nested:fieldAdded:property_type_options', function(event) { APP.entity_types.initializePropertyTypeOptionWrapper(event.field.find('.property-type-option-wrapper')); });
  },
  initializePropertyTypeWrapper: function(propertyTypeWrapper) {
    var dataTypeField = propertyTypeWrapper.find('.data-type-field');
    dataTypeField.change(function () { APP.entity_types.dataTypeChanged(propertyTypeWrapper); });
    if(dataTypeField.val()) {
      this.dataTypeChanged(propertyTypeWrapper);
      this.setFormattedDefaultValue(propertyTypeWrapper);
    }
  },
  dataTypeChanged: function(propertyTypeWrapper) {
    // Determine the selected data type
    var dataType = propertyTypeWrapper.find('.data-type-field').find(':selected').data('key')
    var defaultValueWrapper = propertyTypeWrapper.find('.property-type-default-value-wrapper');
    var defaultValueFormattedFieldContainer = defaultValueWrapper.find('.property-type-default-value-formatted-field-container');
    var options = propertyTypeWrapper.find('.property-type-options');

    // Clear data type specific fields
    options.hide();
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
        $('<input type="checkbox" value="1" />').appendTo(defaultValueFormattedFieldContainer);
        defaultValueWrapper.show();
        break;
      case 'enum':
      case 'set':
        options.find('.property-type-option-wrapper').each(function () { APP.entity_types.initializePropertyTypeOptionWrapper($(this)); });
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
  initializePropertyTypeOptionWrapper: function(propertyTypeOptionWrapper) {
    var propertyTypeWrapper = propertyTypeOptionWrapper.closest('.property-type-wrapper');
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
        this.checkedDefaultFields.prop('checked', false);
      }
    }
  },
  optionsDefaultUncheckOthers: function(field) {
    // Uncheck all other default checkboxes.
    field.closest('.property-type-options').find('.property-type-option-default-field').prop('checked', false);
    // Check this checkbox
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