APP.communication_records = {
  _form: function() {
    // Add auto size to textareas
    $('.communication-record').find('textarea.summary').autosize();

    $('#communication-records-container').on('click', 'div.methods>div, div.emotions>div', function() {
      var icon = $(this), iconParent = icon.closest('div.methods, div.emotions'), selection = icon.data('value');
      iconParent.children().removeClass('active');
      icon.addClass('active');
      iconParent.find('input').val(selection);
    });
  },
}
