APP.entities = {
  init: function() {
    var form = $('form.new_entity, form.edit_entity');
    $('#entity_color').minicolors();

    form.find('.reservation-rule-wrapper').each(function () { APP.global.nested_objects.initWrapper($(this)); })
    $(document).on('nested:fieldAdded:reservation_rules', function(event) { APP.global.nested_objects.initWrapper(event.field); });

    form.find('.reservation-rule-scope-wrapper').each(function () { APP.global.nested_objects.initWrapper($(this)); })
    $(document).on('nested:fieldAdded:reservation_rule_scopes', function(event) { APP.global.nested_objects.initWrapper(event.field); });

	$('div.entity-images-container').magnificPopup({ delegate: 'a', type: 'image',  gallery:{ enabled:true } });
  }
}