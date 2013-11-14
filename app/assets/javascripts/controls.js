APP.global.replaceControls = function() {
  $('select:not(.select2)').cwicDropdown();
  $(':checkbox').cwicCheckbox();
  $('input[type=file]').cwicFileField();
}

// Replace controls when the DOM is fully loaded
$(document).ready(function() {
  APP.global.replaceControls();
  // Replace controls when a page is loaded using Turbolinks and when DOM nodes are added to the document body or its children
  $(document).on('page:load thisIsADifferentBody', function() {
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
        var dropdownReplacement = $('<div class="dropdown" data-name="' + dropdown.attr('name') + '"><div class="dropdown-current-option">' + defaultOption.text() + '</div><div class="dropdown-options"><div class="dropdown-current-option">' + defaultOption.text() + '</div></div></div>');
        options.each(function() {
          var option = $(this);
          var optionReplacement = $('<div class="dropdown-option" data-value="' + option.attr('value') + '">' + option.text() + '</div>');
          if (optionReplacement.data('value') == defaultOption.val()) {
            optionReplacement.addClass('selected');
          }
          dropdownReplacement.find('.dropdown-options').append(optionReplacement);
        });
        dropdown.addClass('replaced').after(dropdownReplacement);
        cwic_controls.dropdown.bindEvents(dropdown, dropdownReplacement);
      },
      bindEvents: function(dropdown, dropdownReplacement) {
        // Bind events
        
        /* Update dropdown when value of select element changes */
        dropdown.on('change keyup click', function(e) {
          var selectedOption = $(this).find('option:selected');
          dropdownReplacement.find('.dropdown-current-option').text(selectedOption.text());
          dropdownReplacement.find('.dropdown-option').removeClass('selected');
          dropdownReplacement.find('.dropdown-option[data-value=' + selectedOption.val() + ']').addClass('selected');
        });
        
        /* Add class to autosubmit dropdowns on change */
        if (dropdown.is('.autosubmit')) {
          dropdown.on('change', function(e) {
            dropdownReplacement.addClass('autosubmit-busy');
          });
        }
        
        /* Open dropdown on click */
        dropdownReplacement.find('.dropdown-current-option').each(function() {
          $(this).on('click', function(e) {
            if(dropdownReplacement.hasClass('open')) {
              dropdownReplacement.removeClass('open');
            } else {
              dropdownReplacement.addClass('open');
            }
          });
        });
        
        /* Update select element when dropdown option is clicked */
        dropdownReplacement.find('.dropdown-option').each(function() {
          $(this).on('click', function(e) {
            var optionReplacement = $(this);
            dropdown.val(optionReplacement.data('value')).trigger('change');
            optionReplacement.parent('.dropdown-options').siblings('.dropdown-current-option').text(dropdown.find('option:selected').text());
            optionReplacement.addClass('selected').siblings('.dropdown-option').removeClass('selected');
            dropdownReplacement.removeClass('open');
          });
        });
        
        /* Close dropdown when there's a click event outside dropdown */
        $(document).on('click', function(e) {
          if(!$(e.target).is(dropdownReplacement.children().add(dropdownReplacement))) {
            dropdownReplacement.removeClass('open');
          }
        });
      },
    },
    checkbox: {
      make: function(checkbox) {
        var label = $('label[for=' + checkbox.attr('id') + ']');
        var checkboxReplacement = $('<div class="cwic-checkbox" data-name="' + checkbox.attr('name') + '"><div class="inner"></div></div>');
        if (checkbox.is(':checked')) {
          checkboxReplacement.addClass('checked');
        }
        checkbox.addClass('replaced').after(checkboxReplacement);
        cwic_controls.checkbox.bindEvents(checkbox, checkboxReplacement);
      },
      bindEvents: function(checkbox, checkboxReplacement) {
        checkbox.on('change', function(e) {
          if($(this).is(':checked')) {
            checkboxReplacement.addClass('checked');
          } else {
            checkboxReplacement.removeClass('checked');
          }
        });
        checkboxReplacement.on('click', function(e) {
          if($(this).hasClass('checked')) {
            checkbox.prop('checked', false).trigger('change');
            $(this).removeClass('checked');
          } else {
            checkbox.prop('checked', true).trigger('change');
            $(this).addClass('checked');
          }
        });
      },
    },
    file_field: {
      make: function(fileField) {
        var fileFieldReplacement = $('<div class="cwic-filefield">' + jsLang.controls.upload_file + '</div>');
        if (fileField.val()) {
          fileFieldReplacement.addClass('filled').text(fileField.val());
        }
        fileField.addClass('replaced').after(fileFieldReplacement);
        cwic_controls.file_field.bindEvents(fileField, fileFieldReplacement);
      },
      bindEvents: function(fileField, fileFieldReplacement) {
        fileField.on('change', function(){
          if (!fileField.val()) {
            fileFieldReplacement.removeClass('filled');
          } else {
            fileFieldReplacement.addClass('filled').text(fileField.val());
          }
        });
        fileFieldReplacement.on('click', function(e) {
          fileField.trigger('click');
        });
      },
    },
  };
  
  $.fn.extend({
    cwicDropdown: function() {
      var elems = $(this).filter('select:not([multiple], .replaced)');
      elems.each(function() {
        cwic_controls.dropdown.make($(this));
      });
    },
    cwicCheckbox: function() {
      var elems = $(this).filter(':checkbox:not(.replaced)');
      elems.each(function() {
        cwic_controls.checkbox.make($(this));
      });
    },
    cwicFileField: function() {
      var elems = $(this).filter('input[type=file]:not(.replaced)');
      elems.each(function() {
        cwic_controls.file_field.make($(this));
      });
    },
  });
})(jQuery);