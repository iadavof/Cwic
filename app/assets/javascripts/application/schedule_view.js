APP.schedule_view = {
  horizontal_calendar_day: function() {
    new CwicScheduleView({
      container: 'calendar',
      backend_url: Routes.organisation_schedule_view_path(current_organisation),
      patch_reservation_url: Routes.organisation_reservations_path(current_organisation),
      organisation_client_url: Routes.organisation_organisation_clients_path(current_organisation),
      view: 'horizontalCalendar',
      zoom: 'day',
    });
    this.bind_new_reservation_modal_button();
  },
  horizontal_calendar_week: function() {
    new CwicScheduleView({
      container: 'calendar',
      backend_url: Routes.organisation_schedule_view_path(current_organisation),
      patch_reservation_url: Routes.organisation_reservations_path(current_organisation),
      organisation_client_url: Routes.organisation_organisation_clients_path(current_organisation),
      view: 'horizontalCalendar',
      zoom: 'week',
    });
    this.bind_new_reservation_modal_button();
  },
  vertical_calendar_day: function() {
    new CwicScheduleView({
      container: 'calendar',
      backend_url: Routes.organisation_schedule_view_path(current_organisation),
      patch_reservation_url: Routes.organisation_reservations_path(current_organisation),
      organisation_client_url: Routes.organisation_organisation_clients_path(current_organisation),
      view: 'verticalCalendar',
      zoom: 'day',
    });
    this.bind_new_reservation_modal_button();
  },
  bind_new_reservation_modal_button: function() {
    $('#open-new-reservation-modal-button').on('click', function(e) {
      e.preventDefault();
      var reservationForm = APP.modal.openModal('new_reservation_popup', $('#reservation-form-modal-blueprint').data('blueprint'));
      APP.global.initializeSpecialFormFields(reservationForm);
      return false;
    });
  }
};
