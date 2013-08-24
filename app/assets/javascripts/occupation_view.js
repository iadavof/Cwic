APP.occupation = {
  init: function() {

  },
};

Object.extend = function(destination, source) {
    for(var property in source) {
        if(source.hasOwnProperty(property)) {
            if( destination[property] != null && typeof destination[property] == 'object') {
              destination[property] = Object.extend(destination[property], source[property])
            } else {
              destination[property] = source[property];
            }
        }
    }
    return destination;
};

IADAoccupationView.prototype.currentMonth = 8;
IADAoccupationView.prototype.currentYear = 2013;

function IADAoccupationView(options) {

    this.options = Object.extend({
        container: 'schedule-container',
        backend_url: 'url to backend',
        view: 'dayOccupation'
    }, options || {});

    if(this.options.view == 'dayOccupation') {
        this.renderDayOccupation();
    } else if(this.options.view == 'weekOccupation') {
        this.renderWeekOccupation();
    }

}

IADAoccupationView.prototype.renderDayOccupation = function() {
	alert('day');
}


IADAoccupationView.prototype.getEntities = function() {
	occ = this;
	$.ajax({
        type: 'POST',
        url: this.options.backend_url  + '/entities',
        data: {

        }
    }).success(function(response) {
        occ.createEntityRows(response);
    });
}


IADAoccupationView.prototype.createEntityRows = function(response) {
	for(ent_nr in response.entities) {
		entity = response.entities[ent_nr];
		row = this.getTemplateClone('entityRowTemplate');
		row.attr('id', 'entity_' + entity.id);
	}
}

IADAoccupationView.prototype.createEntityRow = function(entity) {

}

IADAoccupationView.prototype.renderWeekOccupation = function() {
	alert('week');
}

IADAoccupationView.prototype.getTemplateClone = function(id) {
    var newitem = $('#occupation-templates').find('#'+id).clone();
    newitem.removeAttr('id');
    newitem.show();
    return newitem;
}