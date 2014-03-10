APP.occupation_view = {
  day_occupation: function() {
    new IADAoccupationView({
      container: 'occupation-container',
      backend_url: Routes.organisation_occupation_view_path(current_organisation),
      view: 'dayOccupation',
      schedule_url: Routes.organisation_schedule_view_horizontal_calendar_day_path(current_organisation),
    });
  },
  week_occupation: function() {
    new IADAoccupationView({
      container: 'occupation-container',
      backend_url: Routes.organisation_occupation_view_path(current_organisation),
      view: 'weekOccupation',
      schedule_url: Routes.organisation_schedule_view_horizontal_calendar_week_path(current_organisation),
    });
  },
};
