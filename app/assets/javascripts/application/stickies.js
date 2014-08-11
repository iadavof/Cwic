APP.stickies = {
  loadStickies: function() {
    var container = $('#note-container');
    if(container.length) {
      new CwicStickyNotes({
        container: container.attr('id'),
        resource: {
          class_name: container.data('resource-class-name'),
          id: container.data('resource-id')
        },
        backend_url: Routes.organisation_stickies_path(current_organisation),
        current_author: current_user,
      });
    }
  }
}
