APP.entity_types = {
  init: function() {
    var form = $('form.new_entity_type, form.edit_entity_type');
    form.submit(function () { APP.entity_types.parseFormattedDefaultValues($(this)); APP.entity_types.updateIndexes($(this)); })
    form.find('.property-wrapper').each(function () { APP.entity_types.initializePropertyWrapper($(this)); })
    form.find('.option-wrapper').each(function () { APP.entity_types.initializeNestedObjectWrapper($(this)); });
    $('#tabs').tabs({ active: this.determineFirstTab() });
    this.initIconSelector();
    $('#entity-type-properties').sortable({ placeholder: 'ui-state-highlight', handle: '.sort-handle' });
    $('#options').sortable({ placeholder: 'ui-state-highlight', handle: '.sort-handle' });
    $(document).on('nested:fieldAdded:properties', function(event) { APP.entity_types.initializePropertyWrapper(event.field); });
    $(document).on('nested:fieldAdded:options', function(event) { APP.entity_types.onNestedFieldAddedOptions(event.field); });
  },
  initIconSelector: function() {
    $(".field.icon-select").on('click', 'label', function() {
      $(".field.icon-select label").removeClass('active');
        $(this).addClass('active');
    });
  },
  determineFirstTab: function() {
    // Determines the first tab to open. This is the first tab with errors (if any, else simply open the first tab)
    var first = 0;
    $('#tabs .nav a').each(function(index) {
      var id = $(this).attr('href');
      var tab = $('#tabs ' + id);
      if(tab.find('div.field_with_errors').length) {
        first = index
        return false; // Break
      }
    });
    return first;
  },
  onNestedFieldAddedOptions: function(field) {
    if(field.hasClass('property-option-wrapper')) {
      this.initializePropertyOptionWrapper(field);
    } else {
      this.initializeNestedObjectWrapper(field);
    }
  },
  initializeNestedObjectWrapper: function(wrapper) {
    wrapper.find('.icon-edit').click(function() { APP.entity_types.editNestedObjectWrapper(wrapper) });
    wrapper.find('.icon-ok').click(function() { APP.entity_types.doneNestedObjectWrapper(wrapper) });

    this.enableExtraNestedObjectRemoveLink(wrapper);

    // If the option is not valid, then show form immediately. New properties are also not valid by default.
    if(wrapper.attr('data-valid') == 'false') {
      this.editNestedObjectWrapper(wrapper);
    }
  },
  enableExtraNestedObjectRemoveLink: function(wrapper) {
    // Make the extra remove link work
    wrapper.find('.remove-nested-fields-extra').click(function () { $(this).closest('.fields').find('.remove_nested_fields').click(); });
  },
  editNestedObjectWrapper: function(wrapper) {
    wrapper.find('.view').hide();
    wrapper.find('.form').show();
  },
  doneNestedObjectWrapper: function(wrapper) {
    // Copy all data from input fields to corresponding containers in view
    wrapper.find('.view [data-field]').each(function () {
      var input = wrapper.find('.form [data-field="' + $(this).attr('data-field') + '"]');
      if(input) {
        if(input.is('select')) {
          // We are dealing with a checkbox field
          var value = (input.val() ? input.find(':selected').text() : '');
        } else if(input.is('input') && input.attr('type') == 'checkbox') {
          // We are dealing with a checkbox field
          var value = input.is(':checked') ? jsLang.global.yes : jsLang.global.no;
        } else {
          // We are dealing with a normal field
          var value = input.val();
        }
      } else {
        var value = '';
      }
      $(this).html(formatText(value));
    });
    wrapper.find('.form').hide();
    wrapper.find('.view').show();
  },
  initializePropertyWrapper: function(propertyWrapper) {
    // Initialize field actions
    var dataTypeField = propertyWrapper.find('select[data-field="data-type"]')
    dataTypeField.change(function () { APP.entity_types.dataTypeChanged(propertyWrapper); });
    propertyWrapper.find('.property-options .clear-default-link').click(function() { APP.entity_types.optionsDefaultUncheckAll(propertyWrapper); });

    // Make the options sortable
    propertyWrapper.find('.property-options .target').sortable({ placeholder: 'ui-state-highlight', handle: '.sort-option-handle' });

    // Initialize data type specific fields
    if(dataTypeField.val()) {
      this.dataTypeChanged(propertyWrapper);
      this.setFormattedDefaultValue(propertyWrapper);
    }

    this.initializeNestedObjectWrapper(propertyWrapper);
    propertyWrapper.find('.icon-ok').unbind('click').click(function() { APP.entity_types.donePropertyWrapper(propertyWrapper) });
  },
  donePropertyWrapper: function(propertyWrapper) {
    this.doneNestedObjectWrapper(propertyWrapper);
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
      propertyWrapper.find('.view [data-field="property-options"]').html(formatText(arrayToSentence(options)));
      propertyWrapper.find('.view [data-field="default-value"]').html(formatText(arrayToSentence(defaultValues)));
    }
  },
  dataTypeChanged: function(propertyWrapper) {
    // Determine the selected data type
    var dataType = propertyWrapper.find('select[data-field="data-type"]').find(':selected').data('key')
    var requiredWrapper = propertyWrapper.find('.required');
    var defaultValueWrapper = propertyWrapper.find('.default-value');
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
    switch(dataType) {
      case 'enum':
      case 'set':
        options.find('.property-option-wrapper').each(function () { APP.entity_types.initializePropertyOptionWrapper($(this)); });
        if(options.find('.target').children().length == 0) {
          options.find('.add_nested_fields').click(); // Make sure there is already one row added (we always want to add at least one option, and else it looks ugly)
        }
        options.show();
        break;
      case 'text':
        $('<textarea data-field="default-value"></textarea>').appendTo(defaultValueFormattedFieldContainer);
        defaultValueWrapper.show();
        break;
      case 'boolean':
        requiredWrapper.hide();
        $('<input type="checkbox" value="1" data-field="default-value" />').appendTo(defaultValueFormattedFieldContainer);
        defaultValueWrapper.show();
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
  initializePropertyOptionWrapper: function(propertyOptionWrapper) {
    var propertyWrapper = propertyOptionWrapper.closest('.property-wrapper');

    // Swap the newly created field to the right spot
    propertyWrapper.find('.property-options .target').append(propertyOptionWrapper);

    var dataType = propertyWrapper.find('select[data-field="data-type"]').find(':selected').data('key');
    if(dataType == 'set') {
      // Set: transform fields to check boxes.
      propertyOptionWrapper.find('.default-field')
        .attr('type', 'checkbox')
        .off('click');
    } else {
      // Enum: transform fields to radio buttons and make sure there can only be one selected at the same time.
      propertyOptionWrapper.find('.default-field')
        .attr('type', 'radio')
        .click(function() { APP.entity_types.optionsDefaultUncheckOthers($(this)); });

      // Check if there are not already two or more items default
      var checkedDefaultFields = propertyWrapper.find('.default-field:checked');
      if(checkedDefaultFields.size() > 1) {
        // There were already two or more items selected (this could happen when we change from set to enum): uncheck all items.
        checkedDefaultFields.prop('checked', false);
      }
    }
  },
  initializePropertyOptionClearLink: function() {
    // Add the action to the clear button
    propertyOptionWrapper.find('.default-field')
        .attr('type', 'radio')
        .click(function() { APP.entity_types.optionsDefaultUncheckOthers($(this)); });
  },
  optionsDefaultUncheckAll: function(propertyWrapper) {
    // Uncheck all default checkboxes/radio buttons.
    propertyWrapper.find('.default-field').prop('checked', false);
  },
  optionsDefaultUncheckOthers: function(field) {
    // Uncheck all other default radio buttons.
    field.closest('.property-options').find('.default-field').prop('checked', false);
    // Check this radio button
    field.prop('checked', true);
  },
  updateIndexes: function(form) {
    $(form).find('.property-wrapper').each(function(index) {
      $(this).find('.index-field').val(index);
      $(this).find('.property-option-wrapper').each(function(index) {
        $(this).find('.index-field').val(index);
      });
    });
    $(form).find('.option-wrapper').each(function(index) {
      $(this).find('.index-field').val(index);
    });
  }
};