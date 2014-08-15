APP.modal = {
  openModal: function(modalID, content, closeCallback) {
    var closeCallback = closeCallback || this.closeModal;

    var overlay = $('a.overlay');
    overlay.on('click', closeCallback);

    var modalDiv = $('div.modal');
    modalDiv.attr('id', modalID);
    modalDiv.find('a.close').on('click', closeCallback);

    // Also perform close on hitting ESC
    $(document).on('keyup.escape', function(e) {
      if (e.keyCode == 27) { closeCallback(e); }
    });

    // Content toevoegen aan modal
    // To be sure, remove all the content of the modalDiv
    modalDiv.empty();
    modalDiv.append(content);

    // Open overlay
    overlay.addClass('opened');
    $('html').addClass('with-overlay');

    // Show modal
    modalDiv.addClass('opened');

    return modalDiv;
  },
  closeModal: function(e) {
    if(e != null) {
      e.preventDefault();
    }

    var modalDiv = $('div.modal');

    // Close modal
    modalDiv.removeClass('opened');

    modalDiv.children(':not(a.close)').remove();
    modalDiv.removeAttr('id');

    var overlay = $('a.overlay');

    // Sluit overlay
    overlay.removeClass('opened');
    $('html').removeClass('with-overlay');

    // Remove events from the overlay
    overlay.off('click');
    overlay.find('a.close').off('click');

    // Remove close event from ESC button
    $(document).off('keyup.escape');

    // Also remove the enter event if this is used
    $(document).off('keyup.enter');


    if(e != null) {
      return false;
    }
  }
}
