APP.occupation_view = {
  day: function() {
    new CwicOccupationView({
      container: 'occupation-container',
      backend_url: Routes.organisation_occupation_view_path(current_organisation),
      view: 'dayOccupation',
      schedule_url: Routes.organisation_schedule_view_horizontal_day_path(current_organisation),
    });
  },
  week: function() {
    new CwicOccupationView({
      container: 'occupation-container',
      backend_url: Routes.organisation_occupation_view_path(current_organisation),
      view: 'weekOccupation',
      schedule_url: Routes.organisation_schedule_view_horizontal_week_path(current_organisation),
    });
  },
};
