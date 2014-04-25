(function($) {
  var cwic_controls = {};

  ///
  // Cwic controls base (mainly applicable for checkboxes and radio buttons)
  ///
  cwic_controls.base = {
    $field: null,
    $replacement: null,
    type: null,
    setField:function(field) {
      this.$field = field;
      this.$replacement = this.$field.next('.cwic-' + this.type.replace('_', '-'));
    },
    // General code
    destroy: function(field) {
      this.setField(field);
      $replacement.remove();
      $field.off('.cwicControl').removeClass('replaced');
    },
    recreate: function(field) {
      this.destroy(field);
      this.create(field);
    },
    nextAction: function() { },
    prevAction: function() { },
    bindKeyEvents: function() {
      var cc = this;
      // Make sure we can select this control with tab
      this.$replacement.attr('tabindex', '0');
      this.$replacement.on('keyup', function(event) { cc.keyboardHandler.call(cc, event, $(this)); });
    },
    keyboardHandler: function(event, field) {
      switch(event.which) {
        case 13: // Spacebar
        case 32: // Enter
          this.primaryAction(field);
          break;
        case 37: // Left
        case 38: // Up
          this.prevAction(field);
          break;
        case 39: // Right
        case 40: // Down
          this.nextAction(field);
          break;
      }
      return false;
    },
    // The base code below is mainly for Cwic checkboxes and radio buttons
    create: function(field) {
      this.$field = field;
      this.$replacement = $('<div class="cwic-'+ this.type.replace('_', '-') +'" data-name="' + this.$field.attr('name') + '"><div class="inner"></div></div>');
      if (this.$field.is(':checked')) {
        this.$replacement.addClass('checked');
      }
      this.$field.addClass('replaced').after(this.$replacement);
      this.bindEvents();
    },
    bindEvents: function() {
      var cc = this;
      this.$field.on('change.cwicControl', function(event) { cc.onChangeEvent(event, $(this)); });
      this.$replacement.on('click', function() { cc.primaryAction.call(cc, $(this)); });
      this.bindKeyEvents();
    },
    onChangeEvent: function(event, field) {
      setField(field);
      this.$field.val() ? this.$replacement.addClass('filled').text(this.$field.val()) : this.$replacement.removeClass('filled');
    },
    primaryAction: function(field) {
      console.debug('primary action called')
      this.setField(field);
      this.$field.trigger('click');
    }
  };

  ///
  // Cwic dropdown
  ///
  cwic_controls.dropdown = $.extend({}, cwic_controls.base, {
    type: 'dropdown',
    create: function(field) {
      var cc = this;
      cc.$field = field;
      var options = cc.$field.find('option');
      var defaultOption = cc.$field.find('option:selected');
      cc.$replacement = $('<div class="cwic-dropdown" data-name="' + cc.$field.attr('name') + '"><div class="cwic-dropdown-current-option" data-value="' + defaultOption.attr('value') + '">' + (defaultOption.text() || '...') + '</div><div class="cwic-dropdown-options"><div class="cwic-dropdown-current-option" data-value="' + defaultOption.attr('value') + '">' + (defaultOption.text() || '...') + '</div></div></div>');
      options.each(function() {
        var option = $(this);
        var optionReplacement = $('<div class="cwic-dropdown-option" data-value="' + option.attr('value') + '">' + (option.text() || '...') + '</div>');
        console.debug('creating the dropdownz');
        if (optionReplacement.data('value') === defaultOption.val()) {
          optionReplacement.addClass('selected');
        }
        cc.$replacement.find('.cwic-dropdown-options').append(optionReplacement);
      });
      cc.$field.addClass('replaced').after(cc.$replacement);
      cc.bindEvents();
    },
    bindEvents: function() {
      var cc = this;
      this.$field.on('change.cwicControl keyup.cwicControl click.cwicControl', function(e) { cc.onChangeEvent(e, $(this)); });

      // Add class to autosubmit dropdowns on change
      if (this.$field.is('.autosubmit')) {
        this.$field.on('change.cwicControl', function(e) {
          this.$replacement.addClass('autosubmit-busy');
        });
      }

      // Open dropdown on click
      this.$replacement.find('.cwic-dropdown-current-option').on('click', function() { cc.primaryAction.call(cc, $(this)); });
      this.bindKeyEvents();
      this.$replacement.on('keydown', function (event) { event.preventDefault(); });

      // Update select element when dropdown option is clicked
      this.$replacement.find('.cwic-dropdown-option').each(function() {
        var optionReplacement = $(this);
        optionReplacement.on('click', function(e) {
          dropdown.val(optionReplacement.data('value')).trigger('change');
          optionReplacement.parent('.cwic-dropdown-options').siblings('.cwic-dropdown-current-option').text(this.$field.find('option:selected').text() || '...');
          optionReplacement.addClass('selected').siblings('.cwic-dropdown-option').removeClass('selected');
          this.$replacement.removeClass('open');
        });
      });

      // Close dropdown when there's a click event outside dropdown
      $(document).on('click.cwicControl', function(e) {
        if(!$(e.target).is(cc.$replacement.children().add(cc.$replacement))) {
          cc.$replacement.removeClass('open');
        }
      });
    },
    primaryAction: function(field) {
      this.setField(field);
      this.$replacement.hasClass('open') ? this.$replacement.removeClass('open') : this.$replacement.addClass('open');
    },
    nextAction: function(field) {
      this.setField(field);
      var next = this.$field.find('option:selected').next('option');
      if(next.length > 0) {
        this.$field.val(next.val());
        this.$field.trigger('change');
      }
    },
    prevAction: function(field) {
      this.setField(field);
      var prev = this.$field.find('option:selected').prev('option');
      if(prev.length > 0) {
        this.$field.val(prev.val());
        this.$field.trigger('change');
      }
    }
  });

  ///
  // Cwic radio button
  ///
  cwic_controls.radio_button = $.extend({}, cwic_controls.base, {
    type: 'radio_button',
    primaryAction: function(field) {
      this.setField(field);
      if (!this.$replacement.hasClass('checked')) {
        this.$field.prop('checked', true).trigger('change');
        this.$replacement.addClass('checked');
      }
    },
    onChangeEvent: function(event, field) {
      this.setField(field);
      if (this.$field.is(':checked')) {
        this.$replacement.addClass('checked');
        $('.cwic-radio-button[data-name=' + APP.util.escapeForSelector(this.$replacement.data('name')) + ']').not(this.$replacement).removeClass('checked');
      } else {
        this.$replacement.removeClass('checked');
      }
    }
  });

  ///
  // Cwic checkbox
  ///
  cwic_controls.checkbox = $.extend({}, cwic_controls.base, {
    type: 'checkbox',
    primaryAction: function(field) {
      this.setField(field);
      if (this.$replacement.hasClass('checked')) {
        this.$field.prop('checked', false).trigger('change');
        this.$replacement.removeClass('checked');
      } else {
        this.$field.prop('checked', true).trigger('change');
        this.$replacement.addClass('checked');
      }
    },
    onChangeEvent: function(event, field) {
      this.setField(field);
      this.$field.is(':checked') ? this.$replacement.addClass('checked') : this.$replacement.removeClass('checked');
    }
  });

  ///
  // Cwic file field
  ///
  cwic_controls.file_field = $.extend({}, cwic_controls.base, {
    type: 'file_field',
    create: function() {
      this.$replacement = $('<div class="cwic-filefield">' + jsLang.controls.file_field.upload_file + '</div>');
      if (this.$field.val()) {
        this.$replacement.addClass('filled').text(this.$field.val());
      }
      this.$field.addClass('replaced').after(this.$replacement);
      this.bindEvents();
    },
    onChangeEvent: function(event, field) {
      this.setField(field);
      this.$field.val() ? this.$replacement.addClass('filled').text(this.$field.val()) : this.$replacement.removeClass('filled');
    }
  });


  ///
  // Main jQuery cwicControl function
  ///
  $.fn.cwicControl = function(operation) {
    operation = operation || 'create';
    console.debug('cc'+ operation);
    console.debug($(this));
    replacedFilter = (operation == 'create' ? ':not(.replaced)' : '.replaced');
    $(this).filter('select:not(.nocwic, .select2, [multiple])').filter(replacedFilter).each(function() {
      console.debug('we has select');
      cwic_controls.dropdown[operation]($(this));
    });
    $(this).filter(':radio:not(.nocwic)').filter(replacedFilter).each(function() {
      console.debug('we has radio ' + operation);
      console.debug(cwic_controls.radio_button);
      cwic_controls.radio_button[operation]($(this));
    });
    $(this).filter(':checkbox:not(.nocwic)').filter(replacedFilter).each(function() {
      console.debug('we has checkbox');
      cwic_controls.checkbox[operation]($(this));
    });
    $(this).filter('input[type=file]:not(.nocwic)').filter(replacedFilter).each(function() {
      console.debug('we has file');
      cwic_controls.file_field[operation]($(this));
    });
  };
})(jQuery);
