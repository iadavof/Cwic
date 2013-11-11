(function($) {
  var controls = {
    makeDropdown: function(elem) {
      var dropdown = $(elem);
      var options = dropdown.find('option');
      var defaultOption = dropdown.find('option:selected');
      var dropdownReplacement = $('<div class="dropdown" data-name="' + dropdown.attr('name') + '"><div class="dropdown-current-option">' + defaultOption.text() + '</div><div class="dropdown-options"><div class="dropdown-current-option">' + defaultOption.text() + '</div></div></div>');
      dropdown.on('change keyup click', function() {
        var selectedOption = $(this).find('option:selected');
        dropdownReplacement.find('.dropdown-current-option').text(selectedOption.text());
        dropdownReplacement.find('.dropdown-option').removeClass('selected');
        dropdownReplacement.find('.dropdown-option[data-value=' + selectedOption.val() + ']').addClass('selected');
      });
      if (dropdown.is('.autosubmit')) {
        dropdown.on('change', function() {
          dropdownReplacement.addClass('autosubmit-busy');
        });
      }
      options.each(function() {
        var option = $(this);
        var optionReplacement = $('<div class="dropdown-option" data-value="' + option.attr('value') + '">' + option.text() + '</div>');
        if (optionReplacement.data('value') == defaultOption.val()) {
          optionReplacement.addClass('selected');
        }
        optionReplacement.on('click', function() {
          var currentOptionReplacement = $(this);
          dropdown.val(currentOptionReplacement.data('value')).trigger('change');
          currentOptionReplacement.parent('.dropdown-options').siblings('.dropdown-current-option').text(dropdown.find('option:selected').text());
          currentOptionReplacement.siblings('.dropdown-option').removeClass('selected');
          currentOptionReplacement.addClass('selected');
          dropdownReplacement.removeClass('open');
        });
        dropdownReplacement.find('.dropdown-options').append(optionReplacement);
      });
      dropdownReplacement.find('.dropdown-current-option').each(function() {
        $(this).on('click', function() {
          if(dropdownReplacement.hasClass('open')) {
            dropdownReplacement.removeClass('open');
          } else {
            dropdownReplacement.addClass('open');
          }
        });
      });
      $(document).on('click', function(e) {
        if($(e.target).is(dropdownReplacement.find('div').add(dropdownReplacement))) {
          return;
        } else {
          dropdownReplacement.removeClass('open');
        }
      });
      dropdown.addClass('replaced').hide().after(dropdownReplacement);
    },
  };
  $.fn.extend({
    cwicDropdown: function() {
      var elems = $(this).filter('select:not([multiple])');
      return elems.each(function(i,e) {
        controls.makeDropdown(e);
      });
    },
  });
})(jQuery);