APP.entities = {
  init: function() {
    $('#entity_color').minicolors();
    $('div.entity-images-container').magnificPopup({ delegate: 'a', type: 'image',  gallery: { enabled: true } });
  }
}
