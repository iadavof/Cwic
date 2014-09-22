APP.schedule_view = {
  horizontal_day: function() {
    new CwicScheduleView({
      container: 'calendar',
      view: 'horizontal',
      zoom: 'day',
    });
    this.bind_new_reservation_modal_button();
  },
  horizontal_week: function() {
    new CwicScheduleView({
      container: 'calendar',
      view: 'horizontal',
      zoom: 'week',
    });
    this.bind_new_reservation_modal_button();
  },
  vertical_day: function() {
    new CwicScheduleView({
      container: 'calendar',
      view: 'vertical',
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
