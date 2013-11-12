(function($) {
  var cwic_controls = {
    makeDropdown: function(dropdown) {
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
      dropdown.addClass('replaced').hide().after(dropdownReplacement);
      cwic_controls.bindDropdownEvents(dropdown, dropdownReplacement);
    },
    bindDropdownEvents: function(dropdown, dropdownReplacement) {
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
          optionReplacement.siblings('.dropdown-option').removeClass('selected');
          optionReplacement.addClass('selected');
          dropdownReplacement.removeClass('open');
        });
      });
      
      /* Close dropdown when there's a click event outside dropdown */
      $(document).on('click', function(e) {
        if($(e.target).is(dropdownReplacement.find('div').add(dropdownReplacement))) {
          return;
        } else {
          dropdownReplacement.removeClass('open');
        }
      });
    },
  };
  
  $.fn.extend({
    cwicDropdown: function() {
      var elems = $(this).filter('select:not([multiple])');
      elems.each(function() {
        cwic_controls.makeDropdown($(this));
      });
    },
  });
})(jQuery);