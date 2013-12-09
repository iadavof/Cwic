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
    var repetition = this.getRepetition();
    var spanSelector = this.getSpanSelector();
    var fields = this.getSpanFields(repetition, spanSelector);

    var container = $('#reservation-rule-scope-spans-container')
    if(fields) {
      container.find('.span-wrapper').each(function () { APP.reservation_rule_scopes.initializeSpanWrapper($(this), fields); });
      container.show();
    } else {
      container.hide();
    }
  },
  initializeSpanWrapper: function(spanWrapper, fields) {
    if(typeof fields === 'undefined') {
      var repetition = this.getRepetition();
      var spanSelector = this.getSpanSelector();
      fields = this.getSpanFields(repetition, spanSelector);
    }

    // Hide all span fields
    spanWrapper.find('.field').hide();

    // Rebuild/show repetition unit specific fields
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
            return  ['holiday', 'hour', 'minute'];
        }
        break;
      case 'month':
        switch(spanSelector) {
          case 'days':
            return  ['dom', 'hour', 'minute'];
          case 'nr_dow_of':
            return  ['nrom', 'dow', 'hour', 'minute'];
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
};
