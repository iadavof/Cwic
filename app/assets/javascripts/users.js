APP.registrations = {
  init: function() {
  	APP.organisations.addAddressPickerToForm();
  },
}

APP.sessions = {
	'new': function() {
		var logoClock = new IADAlogoClock({container: 'logo-container-inner'});
	},
}