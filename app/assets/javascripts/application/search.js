APP.search = {
	init: function() {
		APP.reservations.bindStatusSelectorControls(function(button){
			// Also update the background color of the result icon
			var color = $(button).css('background-color');
			$(button).parents('div.result-reservation').find('div.result-icon').css('background-color', color);
		});
	}
}