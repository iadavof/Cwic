APP.reservation_rule_scopes = {
  datepickerDefaultYear: 2000, // We need a leap year
  datePickerDefaultMonth: 4, // We need a month with 31 days that starts at a monday (4 = May)

  init: function() {
    // Initialize events
    $('#reservation_rule_scope_repetition_unit_id').change(APP.reservation_rule_scopes.onRepetitionChanged);
    $('#reservation_rule_scope_span_type').change(APP.reservation_rule_scopes.onSpanTypeChanged);

    this.initializeSpanType($(this));
    this.initializeSpanWrappers($(this));
    $(document).on('nested:fieldAdded:spans', function(event) { APP.reservation_rule_scopes.initializeSpanWrapper(event.field); });
  },
  onRepetitionChanged: function() {
    // (Re)initialize span selector field
    APP.reservation_rule_scopes.initializeSpanType();
    // Clear old span data (does not make sense for new repetition)
    $('#reservation-rule-scope-spans').empty();
    // (Re)initialize all span wrappers
    APP.reservation_rule_scopes.initializeSpanWrappers();
  },
  initializeSpanType: function() {
    var repetition = APP.reservation_rule_scopes.getRepetition();

    // Determine options for span selector based on repetition
    var spanTypeOptions = APP.reservation_rule_scopes.getSpanTypeOptions(repetition);

    // Rebuild and show span selector or hide it
    if(spanTypeOptions) {
      APP.util.fillDropdownWithItems($('#reservation_rule_scope_span_type'), spanTypeOptions, { prompt: true })
      $('#reservation-rule-scope-span-selector-wrapper').show();
    } else {
      $('#reservation-rule-scope-span-selector-wrapper').hide();
    }
  },
  getSpanTypeOptions: function(repetition) {
    switch(repetition) {
      case 'year':
        return jsLang.reservation_rule_scopes.span_types.year;
      case 'month':
        return jsLang.reservation_rule_scopes.span_types.month;
      default:
        return null; // Geen span selector mogelijkheid (bij de repetition worden spans altijd op dezelfde manier opgegeven)
    }
  },
  onSpanTypeChanged: function() {
    // Clear old span data (does not make sense for new span type)
    $('#reservation-rule-scope-spans').empty();
    // (Re)initialize all span wrappers
    APP.reservation_rule_scopes.initializeSpanWrappers();
  },
  initializeSpanWrappers: function() {
    var repetition = this.getRepetition();
    var spanType = this.getSpanType();
    //var fields = this.getSpanFields(repetition, spanType);

    var container = $('#reservation-rule-scope-spans-container');
    if(this.useSpans(repetition, spanType)) {
      container.find('.span-wrapper').each(function () { APP.reservation_rule_scopes.initializeSpanWrapper($(this)); });
      if(container.find('.span-wrapper').length == 0) {
        // Add initial empty span wrapper if we do not have any yet
        container.find('#add-span-wrapper-link').trigger('click');
      }
      container.show();
    } else {
      container.hide();
    }
  },
  initializeSpanWrapper: function(spanWrapper) {
    var repetition = this.getRepetition();
    var spanType = this.getSpanType();

    var fromWrapper = spanWrapper.find('.from .field-container');
    var toWrapper = spanWrapper.find('.to .field-container');

    fromWrapper.empty();
    toWrapper.empty();

    if(this.useSpanDatepicker(repetition, spanType)) {
      var datepickerFrom = $('<input type="text" class="datepicker-field" />');
      var datepickerFromAlt = $('<input type="text" class="datepicker-alt-field" />');
      var datepickerTo = $('<input type="text" class="datepicker-field" />');
      var datepickerToAlt = $('<input type="text" class="datepicker-alt-field" />');
      fromWrapper.append(datepickerFrom).append(datepickerFromAlt);
      toWrapper.append(datepickerTo).append(datepickerToAlt);
    } else if(this.useSpanTimepicker(repetition, spanType)) {
      var timepickerFrom = $('<input type="text" class="timepicker-field" />');
      var timepickerTo = $('<input type="text" class="timepicker-field" />');
      fromWrapper.append(timepickerFrom);
      toWrapper.append(timepickerTo)
    }

    APP.global.initializeSpecialFormFields(spanWrapper);

    if(this.useSpanDatepicker(repetition, spanType)) {
      this.applySpanDatepickerOptions(datepickerFrom, repetition);
      this.applySpanDatepickerOptions(datepickerTo, repetition);
    }
  },
  useSpans: function(repetition, spanType) {
    return this.useSpanDatepicker(repetition, spanType) || this.useSpanTimepicker(repetition, spanType);
  },
  useSpanDatepicker: function(repetition, spanType) {
    switch(repetition) {
      case 'infinite':
        return true;
      case 'year':
        return (spanType == 'dates');
      case 'month':
        return (spanType == 'days');
    }
  },
  useSpanTimepicker: function(repetition, spanType) {
    switch(repetition) {
      case 'day':
        return true;
    }
  },
  applySpanDatepickerOptions: function(field, repetition) {
    altField = field.next();
    field.data('altField', altField);
    options = {};
    if(repetition == 'year' || repetition == 'month') {
      options['minDate'] = moment({ year: this.datepickerDefaultYear, month: this.datePickerDefaultMonth }).startOf(repetition).toDate();
      options['maxDate'] = moment({ year: this.datepickerDefaultYear, month: this.datePickerDefaultMonth }).endOf(repetition).toDate();
    }
    options['dateFormat'] = 'yy-mm-dd';
    //options['altField'] = altField; // Do not use a real alt field anymore, but mimic the behaviour ourselves, Otherwise our type the date your self implementation (using keyup) does not work any more.
    switch(repetition) {
      case 'infinite':
        options['altFormat'] = 'dd-mm-yy';
        break;
      case 'year':
        options['altFormat'] = 'dd-mm';
        break;
      case 'month':
        options['altFormat'] = 'dd';
        break;
    }
    field.on('change', function() { APP.reservation_rule_scopes.spanDatepickerOnChange($(this)); });
    options['onSelect'] = function(date, instance) {
      field = $(this);
      field.data('altField').val($.datepicker.formatDate(options['altFormat'], field.datepicker('getDate')));
      field.trigger('change');
    };
    options['beforeShow'] = function(field, instance) {
      instance.dpDiv.addClass('fixed-' + repetition);
    };
    options['onClose'] = function(field, instance) {
      instance.dpDiv.promise().done(function() { instance.dpDiv.removeClass('fixed-' + repetition); }); // Remove the class when closing is fully completed
    };
    options['defaultDate'] = options['minDate'];
    options['hideIfNoPrevNext'] = true;
    field.datepicker('option', options);
    var currentDate = this.spanDatepickerGetDefaultDate(field, repetition);
    if(currentDate) {
      field.datepicker('setDate', currentDate);
    }
    field.css({ width: 0, marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0, borderLeft: 0, borderRight: 0, visibility: 'hidden' });
    altField.on('focus click', function() { field.datepicker('show'); });
    //altField.on('blur', function() { field.datepicker('hide'); }); // Switching months does not work anymore with this enabled
    altField.on('keyup change', function() {
      var value = $(this).val();
      console.debug('value', value);
      try {
        switch(repetition) {
          case 'infinite':
            var date = $.datepicker.parseDate(options['altFormat'], value);
            break;
          case 'year':
            var date = $.datepicker.parseDate(options['altFormat'], value)
            date.setFullYear(APP.reservation_rule_scopes.datepickerDefaultYear);
            break;
          case 'month':
            var date = moment({ year: APP.reservation_rule_scopes.datepickerDefaultYear, month: APP.reservation_rule_scopes.datePickerDefaultMonth, day: value }).toDate();
            break;
        }
      } catch(e) {}
      if(date) {
        console.debug('date', date);
        var formatted = $.datepicker.formatDate(options['dateFormat'], date);
        console.debug('formatted', formatted);
        field.val(formatted).trigger('keyup').trigger('change');
      }
    });
  },
  spanDatepickerGetDefaultDate: function(field, repetition) {
    var fromTo = field.closest('.field-container').data('from-to');
    var spanData = field.closest('.span-wrapper').find('.span-data');
    data = this.getSpanDataFields(spanData, fromTo, ['year', 'month', 'dom']);
    if(data) {
      switch(repetition) {
        case 'infinite':
          var m = moment({ year: data['year'], month: data['month'] - 1, day: data['dom'] });
          break;
        case 'year':
          var m = moment({ year: this.datepickerDefaultYear, month: data['month'] - 1, day: data['dom'] });
          break;
        case 'month':
          var m = moment({ year: this.datepickerDefaultYear, month: this.datePickerDefaultMonth, day: data['dom'] });
          break;
      }
      return m.toDate();
    } else {
      return null;
    }
  },
  spanDatepickerOnChange: function(field) {
    var repetition = this.getRepetition();
    var fromTo = field.closest('.field-container').data('from-to');
    var spanData = field.closest('.span-wrapper').find('.span-data');
    var date = field.datepicker('getDate');
    switch(repetition) {
      case 'infinite':
        spanData.find('.year-' + fromTo).val(date ? date.getFullYear() : null);
      case 'year':
        spanData.find('.month-' + fromTo).val(date ? date.getMonth() + 1 : null);
      case 'month':
        spanData.find('.dom-' + fromTo).val(date ? date.getDate() : null);
    }
  },
  getSpanDataFields: function(spanData, fromTo, fields) {
    var data = {};
    $.each(fields, function(index, field) {
      var value = APP.reservation_rule_scopes.getSpanDataField(spanData, fromTo, field);
      if(value) {
        data[field] = value;
      }
    });
    return ($.isEmptyObject(data) ? null : data);
  },
  getSpanDataField: function(spanData, fromTo, field) {
    var value = spanData.find('.' + field +'-' + fromTo).val();
    return (value ? value : null);
  },
  getSpanFields: function(repetition, spanType) {
    switch(repetition) {
      case 'infinite':
        return ['year', 'month', 'dom'];
      case 'year':
        switch(spanType) {
          case 'dates':
            return  ['month', 'dom'];
          case 'weeks':
            return  ['week'];
          case 'holidays':
            return  ['holiday'];
        }
        break;
      case 'month':
        switch(spanType) {
          case 'days':
            return  ['dom'];
          case 'nr_dow_of':
            return  ['nrom', 'dow'];
        }
        break;
      case 'week':
        return  ['dow'];
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
  getSpanType: function() {
    return $('#reservation_rule_scope_span_type').val();
  },
};
