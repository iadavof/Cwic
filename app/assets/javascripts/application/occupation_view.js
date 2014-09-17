APP.occupation_view = {
  day: function() {
    new CwicOccupationView({
      container: 'occupation-container',
      view: 'dayOccupation',
    });
  },
  week: function() {
    new CwicOccupationView({
      container: 'occupation-container',
      view: 'weekOccupation',
    });
  },
};
