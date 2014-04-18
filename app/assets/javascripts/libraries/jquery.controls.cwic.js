(function($) {
  var cwic_controls = {
    dropdown: {
      create: function(dropdown) {
        // Generate dropdown and add it to DOM
        var options = dropdown.find('option');
        var defaultOption = dropdown.find('option:selected');
        var dropdownReplacement = $('<div class="cwic-dropdown" data-name="' + dropdown.attr('name') + '"><div class="cwic-dropdown-current-option" data-value="' + defaultOption.attr('value') + '">' + (defaultOption.text() || '...') + '</div><div class="cwic-dropdown-options"><div class="cwic-dropdown-current-option" data-value="' + defaultOption.attr('value') + '">' + (defaultOption.text() || '...') + '</div></div></div>');
        options.each(function(i) {
          var option = $(this);
          var optionReplacement = $('<div class="cwic-dropdown-option" data-value="' + option.attr('value') + '">' + (option.text() || '...') + '</div>');
          if (optionReplacement.data('value') === defaultOption.val()) {
            optionReplacement.addClass('selected');
          }
          dropdownReplacement.find('.cwic-dropdown-options').append(optionReplacement);
        });
        dropdown.addClass('replaced').after(dropdownReplacement);
        cwic_controls.dropdown.bindEvents(dropdown, dropdownReplacement);
      },
      bindEvents: function(dropdown, dropdownReplacement) {
        // Bind events

        /* Update dropdown when value of select element changes */
        dropdown.on('change.cwicControl change.cwicDropdown keyup.cwicControl keyup.cwicDropdown click.cwicControl click.cwicDropdown', function(e) {
          var selectedOption = $(this).find('option:selected');
          dropdownReplacement.find('.cwic-dropdown-current-option').text((selectedOption.text() || '...'));
          dropdownReplacement.find('.cwic-dropdown-option').removeClass('selected');
          dropdownReplacement.find('.cwic-dropdown-option[data-value=' + APP.util.escapeForSelector(selectedOption.val()) + ']').addClass('selected');
        });

        /* Add class to autosubmit dropdowns on change */
        if (dropdown.is('.autosubmit')) {
          dropdown.on('change.cwicControl change.cwicDropdown', function(e) {
            dropdownReplacement.addClass('autosubmit-busy');
          });
        }

        /* Open dropdown on click */
        dropdownReplacement.find('.cwic-dropdown-current-option').on('click', function(e) {
          dropdownReplacement.hasClass('open') ? dropdownReplacement.removeClass('open') : dropdownReplacement.addClass('open');
        });

        // Make sure we can select this dropdown with tab
        dropdownReplacement.attr('tabindex', '0');

        /* Update select element when dropdown option is clicked */
        dropdownReplacement.find('.cwic-dropdown-option').each(function() {
          $(this).on('click', function(e) {
            var optionReplacement = $(this);
            dropdown.val(optionReplacement.data('value')).trigger('change');
            optionReplacement.parent('.cwic-dropdown-options').siblings('.cwic-dropdown-current-option').text(dropdown.find('option:selected').text() || '...');
            optionReplacement.addClass('selected').siblings('.cwic-dropdown-option').removeClass('selected');
            dropdownReplacement.removeClass('open');
          });
        });

        /* Close dropdown when there's a click event outside dropdown */
        $(document).on('click.cwicControl click.cwicDropdown', function(e) {
          if(!$(e.target).is(dropdownReplacement.children().add(dropdownReplacement))) {
            dropdownReplacement.removeClass('open');
          }
        });
      },
      destroy: function(dropdown) {
        // Destroy the dropdown and unbind events from select element
        var dropdownReplacement = $(dropdown).next('.cwic-dropdown');
        dropdownReplacement.remove();
        dropdown.off('.cwicDropdown').removeClass('replaced');
      },
      recreate: function(dropdown) {
        // Destroy the dropdown and create it again
        cwic_controls.dropdown.destroy(dropdown);
        cwic_controls.dropdown.create(dropdown);
      },
    },
    radio_button: {
      create: function(radioButton) {
        var radioButtonReplacement = $('<div class="cwic-radio-button" data-name="' + radioButton.attr('name') + '"><div class="inner"></div></div>');
        if (radioButton.is(':checked')) {
          radioButtonReplacement.addClass('checked');
        }
        radioButton.addClass('replaced').after(radioButtonReplacement);
        cwic_controls.radio_button.bindEvents(radioButton, radioButtonReplacement);
      },
      bindEvents: function(radioButton, radioButtonReplacement) {
        radioButton.on('change.cwicControl change.cwicRadioButton', function(e) {
          if ($(this).is(':checked')) {
            radioButtonReplacement.addClass('checked');
            $('.cwic-radio-button[data-name=' + APP.util.escapeForSelector(radioButtonReplacement.data('name')) + ']').not(radioButtonReplacement).removeClass('checked');
          } else {
            radioButtonReplacement.removeClass('checked');
          }
        });
        radioButtonReplacement.on('click', function(e) { cwic_controls.radio_button.changeValue(radioButton, radioButtonReplacement); });

        // Make sure we can select this dropdown with tab
        radioButtonReplacement.attr('tabindex', '0');
        radioButtonReplacement.on('keyup', function (event) { cwic_controls.radio_button.keyEventsHandler(event, radioButton, radioButtonReplacement); });
      },
      changeValue: function(radioButton, radioButtonReplacement) {
        if (!radioButtonReplacement.hasClass('checked')) {
          radioButton.prop('checked', true).trigger('change');
          radioButtonReplacement.addClass('checked');
        }
      },
      destroy: function(radioButton) {
        var radioButtonReplacement = radioButton.next('.cwic-radio-button');
        radioButtonReplacement.remove();
        radioButton.off('.cwicRadioButton').removeClass('replaced');
      },
      keyEventsHandler: function(event, radioButton, radioButtonReplacement) {
        switch(event.which) {
          case 13: // Enter
          case 32: // Space
            cwic_controls.radio_button.changeValue(radioButton, radioButtonReplacement);
            break;
        }
        return false;
      },
      recreate: function(radioButton) {
        cwic_controls.radio_button.destroy(radioButton);
        cwic_controls.radio_button.create(radioButton);
      },
    },
    checkbox: {
      create: function(checkbox) {
        var checkboxReplacement = $('<div class="cwic-checkbox" data-name="' + checkbox.attr('name') + '"><div class="inner"></div></div>');
        if (checkbox.is(':checked')) {
          checkboxReplacement.addClass('checked');
        }
        checkbox.addClass('replaced').after(checkboxReplacement);
        cwic_controls.checkbox.bindEvents(checkbox, checkboxReplacement);
      },
      bindEvents: function(checkbox, checkboxReplacement) {
        checkbox.on('change.cwicControl change.cwicCheckbox', function(e) {
          $(this).is(':checked') ? checkboxReplacement.addClass('checked') : checkboxReplacement.removeClass('checked');
        });

        checkboxReplacement.on('click', function(event) { cwic_controls.checkbox.changeValue(checkbox, checkboxReplacement); });

        // Make sure we can select this dropdown with tab
        checkboxReplacement.attr('tabindex', '0');
        checkboxReplacement.on('keyup', function (event) { cwic_controls.checkbox.keyEventsHandler(event, checkbox, checkboxReplacement); });
      },
      changeValue: function(checkbox, checkboxReplacement) {
        if (checkboxReplacement.hasClass('checked')) {
          checkbox.prop('checked', false).trigger('change');
          checkboxReplacement.removeClass('checked');
        } else {
          checkbox.prop('checked', true).trigger('change');
          checkboxReplacement.addClass('checked');
        }
      },
      keyEventsHandler: function(event, checkbox, checkboxReplacement) {
        switch(event.which) {
          case 13: // Enter
          case 32: // Space
            cwic_controls.checkbox.changeValue(checkbox, checkboxReplacement);
            break;
        }
        return false;
      },
      destroy: function(checkbox) {
        var checkboxReplacement = checkbox.next('.cwic-checkbox');
        checkboxReplacement.remove();
        checkbox.off('.cwicCheckbox').removeClass('replaced');
      },
      recreate: function(checkbox) {
        cwic_controls.checkbox.destroy(checkbox);
        cwic_controls.checkbox.create(checkbox);
      },
    },
    file_field: {
      create: function(fileField) {
        var fileFieldReplacement = $('<div class="cwic-filefield">' + jsLang.controls.file_field.upload_file + '</div>');
        if (fileField.val()) {
          fileFieldReplacement.addClass('filled').text(fileField.val());
        }
        fileField.addClass('replaced').after(fileFieldReplacement);
        cwic_controls.file_field.bindEvents(fileField, fileFieldReplacement);
      },
      bindEvents: function(fileField, fileFieldReplacement) {
        fileField.on('change.cwicControl change.cwicFileField', function() {
          fileField.val() ? fileFieldReplacement.addClass('filled').text(fileField.val()) : fileFieldReplacement.removeClass('filled');
        });

        fileFieldReplacement.on('click', function(e) { cwic_controls.file_field.openFileExplorer(); });

        // Make sure we can select this dropdown with tab
        fileFieldReplacement.attr('tabindex', '0');
        fileFieldReplacement.on('keyup', function (event) { cwic_controls.file_field.keyEventsHandler(event, fileField, fileFieldReplacement); });
      },
      openFileExplorer: function(filefield) {
        fileField.trigger('click');
      },
      keyEventsHandler: function(event, checkbox, checkboxReplacement) {
        switch(event.which) {
          case 13: // Enter
          case 32: // Space
            cwic_controls.file_field.openFileExplorer(fileField);
            break;
          default: return false;
        }
        return false;
      },
      destroy: function(fileField) {
        var fileFieldReplacement = fileField.next('.cwic-filefield');
        fileFieldReplacement.remove();
        fileField.off('.cwicFileField').removeClass('replaced');
      },
      recreate: function(fileField) {
        cwic_controls.file_field.destroy(fileField);
        cwic_controls.file_field.create(fileField);
      },
    },
  };

  $.fn.cwicControl = function(operation) {
    switch(operation) {
    case 'destroy':
      $(this).filter('select.replaced:not([multiple], .select2, .nocwic)').each(function() {
        cwic_controls.dropdown.destroy($(this));
      });
      $(this).filter(':radio.replaced:not(.nocwic)').each(function() {
        cwic_controls.radio_button.destroy($(this));
      });
      $(this).filter(':checkbox.replaced:not(.nocwic)').each(function() {
        cwic_controls.checkbox.destroy($(this));
      });
      $(this).filter('input[type=file].replaced:not(.nocwic)').each(function() {
        cwic_controls.file_field.destroy($(this));
      });
      break;
    case 'recreate':
      $(this).filter('select.replaced:not([multiple], .select2, .nocwic)').each(function() {
        cwic_controls.dropdown.recreate($(this));
      });
      $(this).filter(':radio.replaced:not(.nocwic)').each(function() {
        cwic_controls.radio_button.recreate($(this));
      });
      $(this).filter(':checkbox.replaced:not(.nocwic)').each(function() {
        cwic_controls.checkbox.recreate($(this));
      });
      $(this).filter('input[type=file].replaced:not(.nocwic)').each(function() {
        cwic_controls.file_field.recreate($(this));
      });
      break;
    default:
      $(this).filter('select:not(.replaced, [multiple], .select2, .nocwic)').each(function() {
        cwic_controls.dropdown.create($(this));
      });
      $(this).filter(':radio:not(.replaced, .nocwic)').each(function() {
        cwic_controls.radio_button.create($(this));
      });
      $(this).filter(':checkbox:not(.replaced, .nocwic)').each(function() {
        cwic_controls.checkbox.create($(this));
      });
      $(this).filter('input[type=file]:not(.replaced, .nocwic)').each(function() {
        cwic_controls.file_field.create($(this));
      });
    }
  };
})(jQuery);
