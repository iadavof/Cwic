APP.registrations = {
  init: function() {
  	APP.organisations.addAddressPickerToForm();
  },
}

APP.sessions = {
	'new': function() {
		var logoClock = new CwicLogoClock({container: 'logo-container-inner'});
	},
}
