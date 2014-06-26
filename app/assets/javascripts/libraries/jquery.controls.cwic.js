function CwicControl(field, options) {
  this.options = $.extend({
  }, options || {});

  this.$field = $(field);
  this.$replacement = null;
  this.type = this.detectType();
  return this;
}

CwicControl.prototype.detectType = function() {
  /*if(this.$field.is('select:not([multiple])')) {
    return 'dropdown';
  } else */if(this.$field.is(':radio')) {
    return 'radio_button';
  } else if(this.$field.is(':checkbox')) {
    return 'checkbox';
  } else if(this.$field.is('input[type=file]')) {
    return 'file_field';
  }
};

CwicControl.prototype.create = function() {
  // Create the type specific replacement field.
  this['create_' + this.type]();

  // Add replacement after the field.
  this.$field.addClass('replaced').after(this.$replacement);

  this.bindEvents();
};

CwicControl.prototype.destroy = function() {
  this.$replacement.remove();
  this.$field.off('.cwicControl').removeClass('replaced');
  this.$field.removeData('cwicControl');
  delete this;
};

CwicControl.prototype.recreate = function() {
  this.destroy();
  this.create();
};

/*
CwicControl.prototype.create_dropdown = function() {
  var cc = this.$field;
  cc.select2({
    minimumResultsForSearch: -1,
  });
  var cc = this;
  var options = this.$field.find('option');
  var defaultOption = this.$field.find('option:selected');
  this.$replacement = $('<div class="cwic-dropdown" data-name="' + this.$field.attr('name') + '"><div class="cwic-dropdown-current-option" data-value="' + defaultOption.attr('value') + '">' + (defaultOption.text() || '...') + '</div><div class="cwic-dropdown-options"><div class="cwic-dropdown-current-option" data-value="' + defaultOption.attr('value') + '">' + (defaultOption.text() || '...') + '</div></div></div>');
  options.each(function() {
    var option = $(this);
    var optionReplacement = $('<div class="cwic-dropdown-option" data-value="' + option.attr('value') + '">' + (option.text() || '...') + '</div>');
    if (optionReplacement.data('value') == defaultOption.val()) {
      optionReplacement.addClass('selected');
    }
    cc.$replacement.find('.cwic-dropdown-options').append(optionReplacement);
  });
};
*/

CwicControl.prototype.create_checkbox = function() {
  this.$replacement = $('<div class="cwic-checkbox" data-name="' + this.$field.attr('name') + '"><div class="inner"></div></div>');
  if (this.$field.is(':checked')) {
    this.$replacement.addClass('checked');
  }
};

CwicControl.prototype.create_radio_button = function() {
  this.$replacement = $('<div class="cwic-radio-button" data-name="' + this.$field.attr('name') + '"><div class="inner"></div></div>');
  if (this.$field.is(':checked')) {
    this.$replacement.addClass('checked');
  }
};

CwicControl.prototype.create_file_field = function() {
  this.$replacement = $('<div class="cwic-filefield">' + jsLang.controls.file_field.upload_file + '</div>');
  if (this.$field.val()) {
    this.$replacement.addClass('filled').text(this.$field.val());
  }
};

CwicControl.prototype.closeAction = function() {
  this.$replacement.removeClass('open');
};

CwicControl.prototype.keyboardHandler = function(event) {
  switch(event.which) {
    case 32: // Spacebar
      this.primaryAction(event);
      break;
    case 33: // Page up
    case 36: // Home
      this.pickOptionAction(event, 'first');
      break;
    case 37: // Left
    case 38: // Up
      this.pickOptionAction(event, 'previous');
      break;
    case 39: // Right
    case 40: // Down
      this.pickOptionAction(event, 'next');
      break;
    case 34: // Page down
    case 35: // End
      this.pickOptionAction(event, 'last');
      break;
    case 27: // Escape
      this.closeAction(event);
      break;
    case 13: // Enter
      this.submitForm(event);
      break;
  }
  return false;
};

CwicControl.prototype.onChangeHandler = function(event) {
  this['onChangeHandler_' + this.type]();
};

/*
CwicControl.prototype.onChangeHandler_dropdown = function() {
  var selectedOption = this.$field.find('option:selected');
  if(selectedOption.length > 0) {
    this.$replacement.find('.cwic-dropdown-current-option').text((selectedOption.text() || '...'));
    this.$replacement.find('.cwic-dropdown-option').removeClass('selected');
    this.$replacement.find('.cwic-dropdown-option[data-value=' + APP.util.escapeForSelector(selectedOption.val()) + ']').addClass('selected');
  }
};
*/

CwicControl.prototype.onChangeHandler_checkbox = function() {
  this.$field.is(':checked') ? this.$replacement.addClass('checked') : this.$replacement.removeClass('checked');
};

CwicControl.prototype.onChangeHandler_radio_button = function() {
  if(this.$field.is(':checked')) {
    // Uncheck all other radio buttons
    $('.cwic-radio-button[data-name=' + APP.util.escapeForSelector(this.$replacement.data('name')) + ']').not(this.$replacement).removeClass('checked').attr('tabindex', null);
    this.$replacement.addClass('checked');
    this.$replacement.attr('tabindex', '0'); // This radio button can be selected through tab. The others not.
  } else {
    this.$replacement.removeClass('checked');
  }
};

CwicControl.prototype.onChangeHandler_file_field = function() {
  this.$field.val() ? this.$replacement.addClass('filled').text(this.$field.val()) : this.$replacement.removeClass('filled');
};

CwicControl.prototype.bindEvents = function() {
  var cc = this;

  // Enable label selection
  $('label[for="' + APP.util.escapeJQuerySelectorString(this.$field.attr('id')) + '"]').on('click', function(event) { cc.$replacement.focus(); });

  this.$field.on('change.cwicControl', function(event) { cc.onChangeHandler.call(cc, event); });
  this.$replacement.on('click', function() { cc.primaryAction.call(cc); });

  if(this['bindEvents_' + this.type]) {
    this['bindEvents_' + this.type]();
  }

  // Key events
  this.$replacement.attr('tabindex', '0');
  this.$replacement.on('keydown', function(event) { cc.keyboardHandler.call(cc, event); });
};

/*
CwicControl.prototype.bindEvents_dropdown = function() {
  var cc = this;

  // Add class to autosubmit dropdowns on change
  if (this.$field.is('.autosubmit')) {
    this.$field.on('change.cwicControl', function(e) {
      cc.$replacement.addClass('autosubmit-busy');
    });
  }

  // Update select element when dropdown option is clicked
  this.$replacement.find('.cwic-dropdown-option').each(function() {
    var optionReplacement = $(this);
    optionReplacement.on('click', function(e) {
      cc.$field.val(optionReplacement.data('value')).trigger('change');
      optionReplacement.parent('.cwic-dropdown-options').siblings('.cwic-dropdown-current-option').text(cc.$field.find('option:selected').text() || '...');
      optionReplacement.addClass('selected').siblings('.cwic-dropdown-option').removeClass('selected');
    });
  });

  // Close dropdown when losing focus
  this.$replacement.on('blur.cwicControl', function() { cc.closeAction.call(cc); });
};
*/

CwicControl.prototype.primaryAction = function() {
  this['primaryAction_' + this.type]();
};

/*
CwicControl.prototype.primaryAction_dropdown = function() {
  this.$replacement.hasClass('open') ? this.$replacement.removeClass('open') : this.$replacement.addClass('open');
};
*/

CwicControl.prototype.primaryAction_checkbox = function() {
  this.$field.prop('checked', !this.$replacement.hasClass('checked')).trigger('change');
};

CwicControl.prototype.primaryAction_radio_button = function() {
  if(!this.$replacement.hasClass('checked')) {
    this.$field.prop('checked', true).trigger('change');
  }
};

CwicControl.prototype.primaryAction_file_field = function() {
  this.$field.trigger('click');
};

CwicControl.prototype.previousAction = function(event) {
  event.preventDefault();
  var prev = this.$field.find('option:selected').prev('option');
  if(prev.length > 0) {
    this.setValue(prev.val());
  }
};

CwicControl.prototype.pickOptionAction = function(event, direction) {
  if(this['pickOptionAction_' + this.type]) {
    this['pickOptionAction_' + this.type](event, direction);
  }
};

/*
CwicControl.prototype.pickOptionAction_dropdown = function(event, direction) {
  event.preventDefault(); // Prevent scrolling
  var options = this.$field.find('option');
  var current = options.filter(':checked');
  var option = this.getOptionByDirection(options, current, direction);
  if(option.length > 0) {
    this.$field.val(option.val()).trigger('change');
  }
};
*/

CwicControl.prototype.pickOptionAction_radio_button = function(event, direction) {
  event.preventDefault(); // Prevent scrolling
  var options = $('input:radio[name="' + APP.util.escapeJQuerySelectorString(this.$field.attr('name')) + '"]');
  var current = this.$field;
  var option = this.getOptionByDirection(options, current, direction);
  if(option.length > 0) {
    option.prop('checked', true).trigger('change');
    option.data('cwicControl').$replacement.focus();
  }
};

CwicControl.prototype.getOptionByDirection = function(options, current, direction) {
  switch(direction) {
    case 'first':
      return options.first();
    case 'previous':
      var index = options.index(current) - 1;
      return options.eq(index < 0 ? options.length - 1 : index);
    case 'next':
      var index = options.index(current) + 1;
      return options.eq(index >= options.length ? 0 : index);
    case 'last':
      return options.last();
  }
};

CwicControl.prototype.submitForm = function(event) {
  this.$field[0].form.submit();
};

///
// Main jQuery cwicControl function
///
$.fn.cwicControl = function(operation) {
  operation = operation || 'create';
  replacedFilter = (operation == 'create' ? ':not(.replaced)' : '.replaced');
  $(this).filter(/*select:not(.nocwic, .select2, [multiple]), */':radio:not(.nocwic), :checkbox:not(.nocwic), input[type=file]:not(.nocwic)').filter(replacedFilter).each(function() {
    var field = $(this);
    if(typeof field.data('cwicControl') == 'undefined') {
      field.data('cwicControl', new CwicControl(field));
    }

    // Perform the selected operation, this includes create
    field.data('cwicControl')[operation]();
  });
};
