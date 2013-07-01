$(document).ready(function() {
  var dateOptions = {
                      showOn: 'both',
                    };
  var timeOptions = {
                      showPeriodLabels: false,
                      showOn: 'both',
                    };

  $('#begins_at_date').datepicker(dateOptions);
  $('#begins_at_time').timepicker(timeOptions);
  $('#ends_at_date').datepicker(dateOptions);
  $('#ends_at_time').timepicker(timeOptions);

  var schedule = new IADAscheduleView({container: 'schedule-container'});

});
