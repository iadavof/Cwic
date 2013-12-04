APP.schedule_view = {
  horizontal_calendar_day: function() {
    new IADAscheduleView({
      container: 'calendar',
      backend_url: Routes.organisation_schedule_view_index_path(current_organisation),
      patch_reservation_url: Routes.organisation_reservations_path(current_organisation),
      organisation_client_url: Routes.organisation_organisation_clients_path(current_organisation),
      view: 'horizontalCalendar',
      zoom: 'day',
    });

    $('#open-new-reservation-modal-button').on('click', function(e) {
        e.preventDefault();
        var reservationForm = openModal('new_reservation_popup', $('#reservation-form-modal-blueprint').data('blueprint'));
        APP.global.initializeDateTimePickers(reservationForm);
        return false;
    });
  },
  horizontal_calendar_week: function() {
    new IADAscheduleView({
      container: 'calendar',
      backend_url: Routes.organisation_schedule_view_index_path(current_organisation),
      patch_reservation_url: Routes.organisation_reservations_path(current_organisation),
      organisation_client_url: Routes.organisation_organisation_clients_path(current_organisation),
      view: 'horizontalCalendar',
      zoom: 'week',
    });
  },
  vertical_calendar_day: function() {
    new IADAscheduleView({
      container: 'calendar',
      backend_url: Routes.organisation_schedule_view_index_path(current_organisation),
      patch_reservation_url: Routes.organisation_reservations_path(current_organisation),
      organisation_client_url: Routes.organisation_organisation_clients_path(current_organisation),
      view: 'verticalCalendar',
      zoom: 'day',
    });
  },
  today_and_tomorrow: function() {
    new IADAtodayAndTomorrow({
      container: 'today-and-tomorrow-container',
      backend_url: Routes.organisation_schedule_view_index_path(current_organisation),
      websocket_url: window.location.host + Routes.websocket_path(),
      organisation_id: $('#today-and-tomorrow-container').data('organisation-id'),
    });
  }
};