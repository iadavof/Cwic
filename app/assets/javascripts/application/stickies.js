APP.stickies = {
  loadStickies: function() {
    var container = $('#note-container');
    if(container.length) {
      new CwicStickyNotes({
        container: container.attr('id'),
        backend_url: container.data('backend-url'),
        current_author: current_user,
      });
    }
  }
}
