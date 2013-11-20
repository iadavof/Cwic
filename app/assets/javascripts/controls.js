APP.global.replaceControls = function() {
  $('select').cwicDropdown();
  $(':radio').cwicRadioButton();
  $(':checkbox').cwicCheckbox();
  $('input[type=file]').cwicFileField();
}

// Replace controls when the DOM is fully loaded
$(document).ready(function() {
  APP.global.replaceControls();
  // Replace controls when a page is loaded using Turbolinks and when DOM nodes are added to the document body or its children
  $(document).on('page:load', function() {
    APP.global.replaceControls();
  });
});

(function($) {
  var cwic_controls = {
    dropdown: {
      make: function(dropdown) {
        // Generate dropdown and add it to DOM
        var options = dropdown.find('option');
        var defaultOption = dropdown.find('option:selected');
        var dropdownReplacement = $('<div class="cwic-dropdown" data-name="' + dropdown.attr('name') + '"><div class="cwic-dropdown-current-option" data-value="' + defaultOption.attr('value') + '">' + (defaultOption.text() || '...') + '</div><div class="cwic-dropdown-options"><div class="cwic-dropdown-current-option" data-value="' + defaultOption.attr('value') + '">' + (defaultOption.text() || '...') + '</div></div></div>');
        options.each(function(i) {
          var option = $(this);
          var optionReplacement = $('<div class="cwic-dropdown-option" data-value="' + option.attr('value') + '">' + (option.text() || '...') + '</div>');
          if (optionReplacement.data('value') == defaultOption.val()) {
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
        dropdown.on('change.cwicDropdown keyup.cwicDropdown click.cwicDropdown', function(e) {
          var selectedOption = $(this).find('option:selected');
          dropdownReplacement.find('.cwic-dropdown-current-option').text((selectedOption.text() || '...'));
          dropdownReplacement.find('.cwic-dropdown-option').removeClass('selected');
          dropdownReplacement.find('.cwic-dropdown-option[data-value=' + selectedOption.val() + ']').addClass('selected');
        });
        
        /* Add class to autosubmit dropdowns on change */
        if (dropdown.is('.autosubmit')) {
          dropdown.on('change.cwicDropdown', function(e) {
            dropdownReplacement.addClass('autosubmit-busy');
          });
        }
        
        /* Open dropdown on click */
        dropdownReplacement.find('.cwic-dropdown-current-option').each(function() {
          $(this).on('click.cwicDropdown', function(e) {
            if(dropdownReplacement.hasClass('open')) {
              dropdownReplacement.removeClass('open');
            } else {
              dropdownReplacement.addClass('open');
            }
          });
        });
        
        /* Update select element when dropdown option is clicked */
        dropdownReplacement.find('.cwic-dropdown-option').each(function() {
          $(this).on('click.cwicDropdown', function(e) {
            var optionReplacement = $(this);
            dropdown.val(optionReplacement.data('value')).trigger('change');
            optionReplacement.parent('.cwic-dropdown-options').siblings('.cwic-dropdown-current-option').text(dropdown.find('option:selected').text() || '...');
            optionReplacement.addClass('selected').siblings('.cwic-dropdown-option').removeClass('selected');
            dropdownReplacement.removeClass('open');
          });
        });
        
        /* Close dropdown when there's a click event outside dropdown */
        $(document).on('click.cwicDropdown', function(e) {
          if(!$(e.target).is(dropdownReplacement.children().add(dropdownReplacement))) {
            dropdownReplacement.removeClass('open');
          }
        });
      },
      destroy: function(dropdown) {
        var dropdownReplacement = $(dropdown).next('.cwic-dropdown');
        dropdownReplacement.remove();
        dropdown.off('.cwicDropdown').removeClass('replaced');
      },
      remake: function(dropdown) {
        cwic_controls.dropdown.destroy(dropdown);
        cwic_controls.dropdown.make(dropdown);
      },
    },
    radio_button: {
      make: function(radioButton) {
        var radioButtonReplacement = $('<div class="cwic-radio-button" data-name="' + radioButton.attr('name') + '"><div class="inner"></div></div>');
        if (radioButton.is(':checked')) {
          radioButtonReplacement.addClass('checked');
        }
        radioButton.addClass('replaced').after(radioButtonReplacement);
        cwic_controls.radio_button.bindEvents(radioButton, radioButtonReplacement);
      },
      bindEvents: function(radioButton, radioButtonReplacement) {
        radioButton.on('change.cwicRadioButton', function(e) {
          if ($(this).is(':checked')) {
            radioButtonReplacement.addClass('checked');
            $('.cwic-radio-button[data-name=' + radioButtonReplacement.data('name') + ']').not(radioButtonReplacement).removeClass('checked');
          } else {
            radioButtonReplacement.removeClass('checked');
          }
        });
        radioButtonReplacement.on('click.cwicRadioButton', function(e) {
          if (!$(this).hasClass('checked')) {
            radioButton.prop('checked', true).trigger('change');
            $(this).addClass('checked');
          }
        });
      },
      destroy: function(radioButton) {
        var radioButtonReplacement = radioButton.next('.cwic-radio-button');
        radioButtonReplacement.remove();
        radioButton.off('.cwicRadioButton').removeClass('replaced');
      },
      remake: function(radioButton) {
        cwic_controls.radio_button.destroy(radioButton);
        cwic_controls.radio_button.make(radioButton);
      },
    },
    checkbox: {
      make: function(checkbox) {
        var checkboxReplacement = $('<div class="cwic-checkbox" data-name="' + checkbox.attr('name') + '"><div class="inner"></div></div>');
        if (checkbox.is(':checked')) {
          checkboxReplacement.addClass('checked');
        }
        checkbox.addClass('replaced').after(checkboxReplacement);
        cwic_controls.checkbox.bindEvents(checkbox, checkboxReplacement);
      },
      bindEvents: function(checkbox, checkboxReplacement) {
        checkbox.on('change.cwicCheckbox', function(e) {
          if ($(this).is(':checked')) {
            checkboxReplacement.addClass('checked');
          } else {
            checkboxReplacement.removeClass('checked');
          }
        });
        checkboxReplacement.on('click.cwicCheckbox', function(e) {
          if ($(this).hasClass('checked')) {
            checkbox.prop('checked', false).trigger('change');
            $(this).removeClass('checked');
          } else {
            checkbox.prop('checked', true).trigger('change');
            $(this).addClass('checked');
          }
        });
      },
      destroy: function(checkbox) {
        var checkboxReplacement = checkbox.next('.cwic-checkbox');
        checkboxReplacement.remove();
        checkbox.off('.cwicCheckbox').removeClass('replaced');
      },
      remake: function(checkbox) {
        cwic_controls.checkbox.destroy(checkbox);
        cwic_controls.checkbox.make(checkbox);
      },
    },
    file_field: {
      make: function(fileField) {
        var fileFieldReplacement = $('<div class="cwic-filefield">' + jsLang.controls.file_field.upload_file + '</div>');
        if (fileField.val()) {
          fileFieldReplacement.addClass('filled').text(fileField.val());
        }
        fileField.addClass('replaced').after(fileFieldReplacement);
        cwic_controls.file_field.bindEvents(fileField, fileFieldReplacement);
      },
      bindEvents: function(fileField, fileFieldReplacement) {
        fileField.on('change.cwicFileField', function(){
          if (!fileField.val()) {
            fileFieldReplacement.removeClass('filled');
          } else {
            fileFieldReplacement.addClass('filled').text(fileField.val());
          }
        });
        fileFieldReplacement.on('click.cwicFileField', function(e) {
          fileField.trigger('click');
        });
      },
      destroy: function(fileField) {
        var fileFieldReplacement = fileField.next('.cwic-filefield');
        fileFieldReplacement.remove();
        fileField.off('.cwicFileField').removeClass('replaced');
      },
      remake: function(fileField) {
        cwic_controls.file_field.destroy(fileField);
        cwic_controls.file_field.make(fileField);
      },
    },
  };
  
  $.fn.extend({
    cwicDropdown: function(operation) {
      var elems = $(this).filter('select:not([multiple], .select2)');
      switch(operation)
      {
      case 'destroy':
        elems = elems.filter('.replaced');
        elems.each(function() {
          cwic_controls.dropdown.destroy($(this));
        });
        break;
      case 'remake':
        elems = elems.filter('.replaced');
        elems.each(function() {
          cwic_controls.dropdown.remake($(this));
        });
        break;
      default:
        elems = elems.filter(':not(.replaced)');
        elems.each(function() {
          cwic_controls.dropdown.make($(this));
        });
      }
    },
    cwicRadioButton: function(operation) {      
      var elems = $(this).filter(':radio');
      switch(operation)
      {
      case 'destroy':
        elems = elems.filter('.replaced');
        elems.each(function() {
          cwic_controls.radio_button.destroy($(this));
        });
        break;
      case 'remake':
        elems = elems.filter('.replaced');
        elems.each(function() {
          cwic_controls.radio_button.remake($(this));
        });
        break;
      default:
        elems = elems.filter(':not(.replaced)');
        elems.each(function() {
          cwic_controls.radio_button.make($(this));
        });
      }
    },
    cwicCheckbox: function(operation) {
      var elems = $(this).filter(':checkbox');
      switch(operation)
      {
      case 'destroy':
        elems = elems.filter('.replaced');
        elems.each(function() {
          cwic_controls.checkbox.destroy($(this));
        });
        break;
      case 'remake':
        elems = elems.filter('.replaced');
        elems.each(function() {
          cwic_controls.checkbox.remake($(this));
        });
        break;
      default:
        elems = elems.filter(':not(.replaced)');
        elems.each(function() {
          cwic_controls.checkbox.make($(this));
        });
      }
    },
    cwicFileField: function(operation) {     
      var elems = $(this).filter('input[type=file]');
      switch(operation)
      {
      case 'destroy':
        elems = elems.filter('.replaced');
        elems.each(function() {
          cwic_controls.file_field.destroy($(this));
        });
        break;
      case 'remake':
        elems = elems.filter('.replaced');
        elems.each(function() {
          cwic_controls.file_field.remake($(this));
        });
        break;
      default:
        elems = elems.filter(':not(.replaced)');
        elems.each(function() {
          cwic_controls.file_field.make($(this));
        });
      }
    },
  });
})(jQuery);