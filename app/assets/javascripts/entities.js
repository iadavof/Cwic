APP.entities = {
  init: function() {
    var form = $('form.new_entity, form.edit_entity');
    $('#entity_color').minicolors();
    $('div.entity-images-container').magnificPopup({ delegate: 'a', type: 'image',  gallery:{ enabled:true } });
  }
}
