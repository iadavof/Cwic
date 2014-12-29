APP.entity_types = {
  _form: function() {
    this.initIconSelector();
  },
  initIconSelector: function() {
    $(".field-icon-select").on('click', 'label', function() {
      $(".field-icon-select label").removeClass('active');
        $(this).addClass('active');
    });
  }
};
