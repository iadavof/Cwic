$(document).ready(function() {
  $('#begins_at_date_time').datetimepicker();
  $('#ends_at_date_time').datetimepicker();

  var schedule = new IADAscheduleView({container: 'schedule-container'});

});
