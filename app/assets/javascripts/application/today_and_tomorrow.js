APP.today_and_tomorrow = {
  index: function() {
    new CwicTodayAndTomorrow({
      container: 'today-and-tomorrow-container',
      organisation_id: $('#today-and-tomorrow-container').data('organisation-id'),
    });
  }
}
