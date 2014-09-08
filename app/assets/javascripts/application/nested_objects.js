APP.global.nested_objects = {
  initWrapper: function(wrapper) {
    wrapper.find('.icon-edit').click(function() { APP.global.nested_objects.editWrapper(wrapper) });
    wrapper.find('.icon-ok').click(function() { APP.global.nested_objects.finishWrapper(wrapper) });

    // Make the extra remove link work
    wrapper.find('.remove-nested-fields-extra').click(function () { $(this).closest('.fields').find('.remove_nested_fields').first().click(); });

    // If the option is not valid, then show form immediately. New properties are also not valid by default.
    if(wrapper.attr('data-valid') == 'false') {
      this.editWrapper(wrapper);
    }
  },
  editWrapper: function(wrapper) {
    wrapper.find('.view').hide();
    wrapper.find('.form').show();
  },
  finishWrapper: function(wrapper) {
    // Copy all data from input fields to corresponding containers in view
    wrapper.find('.view [data-field]').each(function () {
      var value = '', input = wrapper.find('.form [data-field="' + $(this).attr('data-field') + '"]');
      if(input) {
        if(input.is('select')) {
          // We are dealing with a checkbox field
          value = (input.val() ? input.find(':selected').text() : '');
        } else if(input.is('input') && input.attr('type') == 'checkbox') {
          // We are dealing with a checkbox field
          value = input.is(':checked') ? jsLang.global.yes : jsLang.global.no;
        } else {
          // We are dealing with a normal field
          value = input.val();
        }
      }
      $(this).html(APP.util.formatText(value));
    });
    wrapper.find('.form').hide();
    wrapper.find('.view').show();
  }
};
