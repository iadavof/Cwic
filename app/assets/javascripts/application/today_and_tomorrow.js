APP.today_and_tomorrow = {
  index: function() {
    new CwicTodayAndTomorrow({
      container: 'today-and-tomorrow-container',
      backend_url: Routes.organisation_today_and_tomorrow_update_path(current_organisation),
      websocket_url: window.location.host + Routes.websocket_path(),
      organisation_id: $('#today-and-tomorrow-container').data('organisation-id'),
    });
  }
}
