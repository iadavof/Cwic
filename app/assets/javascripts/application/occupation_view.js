APP.occupation_view = {
  day: function() {
    new CwicOccupationView({
      container: 'occupation-container',
      entities_url: Routes.organisation_entities_path(current_organisation, { format: 'json' }),
      occupations_url: Routes.organisation_occupation_view_day_path(current_organisation, { format: 'json' }),
      schedule_url: Routes.organisation_schedule_view_horizontal_day_path(current_organisation),
      view: 'dayOccupation',
    });
  },
  week: function() {
    new CwicOccupationView({
      container: 'occupation-container',
      entities_url: Routes.organisation_entities_path(current_organisation, { format: 'json' }),
      occupations_url: Routes.organisation_occupation_view_week_path(current_organisation, { format: 'json' }),
      schedule_url: Routes.organisation_schedule_view_horizontal_week_path(current_organisation),
      view: 'weekOccupation',
    });
  },
};
