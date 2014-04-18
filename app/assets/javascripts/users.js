APP.registrations = {
  afterGoogleMapsLoaded: function() {
    APP.organisations.afterGoogleMapsLoaded();
  }
}

APP.sessions = {
	'new': function() {
		var logoClock = new CwicLogoClock({container: 'logo-container-inner'});
	},
}
