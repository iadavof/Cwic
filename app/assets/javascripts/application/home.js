APP.home = {
  index: function() {
    this.initGridster();
  },
  initGridster: function() {
    var widgetBlockWidth = $('.gridster').width() / 3 - 20;
    $(".gridster").gridster({
      widget_selector: '.widget',
      widget_margins: [10, 10],
      widget_base_dimensions: [widgetBlockWidth, widgetBlockWidth],
      max_cols: 3
    });
  }
}
