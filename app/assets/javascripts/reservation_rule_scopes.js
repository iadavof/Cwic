APP.reservation_rule_scopes = {
  init: function() {
    // Initialize events
    $('#reservation_rule_scope_repetition_unit_id').change(APP.reservation_rule_scopes.onRepetitionChanged);
    $('#reservation_rule_scope_span_selector').change(APP.reservation_rule_scopes.onSpanSelectorChanged);

    this.initializeSpanSelector($(this));
    this.initializeSpanWrappers($(this));
    $(document).on('nested:fieldAdded:spans', function(event) { APP.reservation_rule_scopes.initializeSpanWrapper(event.field); });
  },
  onRepetitionChanged: function() {
    // (Re)initialize span selector field
    APP.reservation_rule_scopes.initializeSpanSelector();

    // (Re)initialize all span wrappers
    APP.reservation_rule_scopes.initializeSpanWrappers();
  },
  initializeSpanSelector: function() {
    var repetition = APP.reservation_rule_scopes.getRepetition();

    // Determine options for span selector based on repetition
    var spanSelectorOptions = APP.reservation_rule_scopes.getSpanSelectorOptions(repetition);

    // Rebuild and show span selector or hide it
    if(spanSelectorOptions) {
      APP.util.fillDropdownWithItems($('#reservation_rule_scope_span_selector'), spanSelectorOptions, { prompt: true })
      $('#reservation-rule-scope-span-selector-wrapper').show();
    } else {
      $('#reservation-rule-scope-span-selector-wrapper').hide();
    }
  },
  getSpanSelectorOptions: function(repetition) {
    switch(repetition) {
      case 'year':
        return jsLang.reservation_rule_scopes.span_selectors.year;
      case 'month':
        return jsLang.reservation_rule_scopes.span_selectors.month;
      default:
        return null; // Geen span selector mogelijkheid (bij de repetition worden spans altijd op dezelfde manier opgegeven)
    }
  },
  onSpanSelectorChanged: function() {
    // (Re)initialize all span wrappers
    APP.reservation_rule_scopes.initializeSpanWrappers();
  },
  initializeSpanWrappers: function() {
    var form = $('form.new_reservation_rule_scope, form.edit_reservation_rule_scope');
    form.find('.span-wrapper').each(function () { APP.reservation_rule_scopes.initializeSpanWrapper($(this)); });
  },
  initializeSpanWrapper: function(spanWrapper) {
    repetition = this.getRepetition();
    spanSelector = this.getSpanSelector();

    // Hide all span fields
    spanWrapper.find('.field').hide();

    // Rebuild/show repetition unit specific fields
    var fields = this.getSpanFields(repetition, spanSelector);
    this.showSpanFields(spanWrapper, fields);
  },
  getSpanFields: function(repetition, spanSelector) {
    switch(repetition) {
      case 'infinite':
        return ['year', 'month', 'dom', 'hour', 'minute'];
      case 'year':
        switch(spanSelector) {
          case 'dates':
            return  ['month', 'dom', 'hour', 'minute'];
          case 'weeks':
            return  ['week', 'dow', 'hour', 'minute'];
          case 'holidays':
            return  ['holidays'];
        }
        break;
      case 'month':
        switch(spanSelector) {
          case 'days':
            return  ['dom', 'hour', 'minute'];
          case 'nr_dow_of':
            return  ['dow', 'hour', 'minute'];
        }
        break;
      case 'week':
        return  ['dow', 'hour', 'minute'];
      case 'day':
        return  ['hour', 'minute'];
    }
  },
  showSpanFields: function(spanWrapper, fields) {
    for(i in fields) {
      field = fields[i];
      spanWrapper.find('.' + field).show();
    }
  },
  getRepetition: function() {
    return $('#reservation_rule_scope_repetition_unit_id :selected').data('key');
  },
  getSpanSelector: function() {
    return $('#reservation_rule_scope_span_selector').val();
  },
  initializePropertyWrapper: function(propertyWrapper) {
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
        .click(function() { APP.entity_types.propertyOptionDefaultUncheckOthers($(this)); });

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
        .click(function() { APP.entity_types.propertyOptionDefaultUncheckOthers($(this)); });
  },
  propertyOptionDefaultUncheckAll: function(propertyWrapper) {
    // Uncheck all default checkboxes/radio buttons.
    propertyWrapper.find('.default-field').prop('checked', false);
  },
  propertyOptionDefaultUncheckOthers: function(field) {
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