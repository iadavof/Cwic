// Most of this code is written such that it support multiple property wrappers on one page.
// At the moment we only have one property wrapper per page, since we have a single form to add or edit one property.
// However, this could change later when we add support for inline editing/adding in of properties directly in the index view.
// TODO: when inline editing support is added (or dropped), review and cleanup this code. Then remove this comment.
APP.entity_type_properties = {
  _form: function() {
    var form = $('form.new_entity_type_property, form.edit_entity_type_property');
    form.find('.property-wrapper').each(function () { APP.entity_type_properties.initPropertyWrapper($(this)); });
    $(document).on('nested:fieldAdded:options', function(event) { APP.entity_type_properties.initPropertyOptionWrapper(event.field); });
    form.submit(this.onFormSubmit);
  },
  initPropertyWrapper: function(propertyWrapper) {
    // Initialize field actions
    var dataTypeField = propertyWrapper.find('.field.data-type select');
    dataTypeField.change(function () { APP.entity_type_properties.dataTypeChanged(propertyWrapper); });

    // Initialize option fields
    propertyWrapper.find('.property-options .clear-default-link').click(function() { APP.entity_type_properties.propertyOptionDefaultUncheckAll(propertyWrapper); });
    propertyWrapper.find('.property-options .target').sortable({ placeholder: 'ui-state-highlight', handle: '.sort-handle' });

    // Initialize data type specific fields
    if(dataTypeField.val()) {
      this.dataTypeChanged(propertyWrapper);
      this.setFormattedDefaultValue(propertyWrapper);
    }
  },
  dataTypeChanged: function(propertyWrapper) {
    // Determine the selected data type
    var dataType = propertyWrapper.find('.field.data-type select :selected').data('key');
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
        options.find('.property-option-wrapper').each(function () { APP.entity_type_properties.initPropertyOptionWrapper($(this)); });
        if(options.find('.target').children().length == 0) {
          options.find('.add_nested_fields').click(); // Make sure there is already one row added (we always want to add at least one option, and else it looks ugly)
        }
        options.show();
        break;
      case 'text':
        defaultValueFormattedField = $('<textarea></textarea>');
        break;
      case 'boolean':
        requiredWrapper.hide();
        defaultValueFormattedField = $('<input type="checkbox" value="1" />');
        break;
      case 'integer':
        defaultValueFormattedField = $('<input type="number" />');
        break;
      case 'float':
        defaultValueFormattedField = $('<input type="number" step="any" />');
        break;
      case 'string':
      default:
        defaultValueFormattedField = $('<input type="text" />');
        break;
    }

    if(defaultValueFormattedField) {
      defaultValueFormattedField.data('field', 'default-value').appendTo(defaultValueFormattedFieldContainer).cwicControl();
      defaultValueWrapper.show();
    }
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
      formattedField.prop('checked', (field.val() == 'true')).trigger('change.cwicControl');
    } else {
      formattedField.val(field.val());
    }
  },
  initPropertyOptionWrapper: function(propertyOptionWrapper) {
    var propertyWrapper = propertyOptionWrapper.closest('.property-wrapper');

    // Swap the newly created field to the right spot
    propertyWrapper.find('.property-options .target').append(propertyOptionWrapper);

    var dataType = propertyWrapper.find('.field.data-type select :selected').data('key');
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
        .change(function() { APP.entity_type_properties.propertyOptionDefaultUncheckOthers($(this)); })
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
      .click(function() { APP.entity_type_properties.propertyOptionDefaultUncheckOthers($(this)); });
  },
  propertyOptionDefaultUncheckAll: function(propertyWrapper) {
    // Uncheck all default checkboxes/radio buttons.
    propertyWrapper.find('.default-field').prop('checked', false).trigger('change.cwicControl');
  },
  propertyOptionDefaultUncheckOthers: function(field) {
    if(field.prop('checked')) {
      // Uncheck all other default radio buttons.
      field.closest('.property-options').find('.default-field').prop('checked', false).trigger('change.cwicControl');
      // Check this radio button
      field.prop('checked', true).trigger('change.cwicControl');
    }
  },
  onFormSubmit: function() {
    // Only one propertyWrapper per form/page for now. See comment on top of this file.
    propertyWrapper = $(this).find('.property-wrapper');
    APP.entity_type_properties.parseFormattedDefaultValue(propertyWrapper);
    APP.entity_type_properties.updateOptionPositions(propertyWrapper);
  },
  updateOptionPositions: function(propertyWrapper) {
    propertyWrapper.find('.property-option-wrapper').each(function(i) {
      $(this).find('.position-field').val(i+1);
    });
  }
};
