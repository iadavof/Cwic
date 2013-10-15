APP.entities = {
  init: function() {
    var form = $('form.new_entity, form.edit_entity');
    $('#entity_color').minicolors();

    form.find('.reservation-rule-wrapper').each(function () { APP.global.nested_objects.initWrapper($(this)); })
    $(document).on('nested:fieldAdded:reservation_rules', function(event) { APP.global.nested_objects.initWrapper(event.field); });
  }
}