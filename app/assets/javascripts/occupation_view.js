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

IADAscheduleView.prototype.options = null;
IADAoccupationView.prototype.currentMonth = 8;
IADAoccupationView.prototype.currentYear = 2013;
IADAoccupationView.prototype.occupationContainer = null;

function IADAoccupationView(options) {

    this.options = Object.extend({
        container: 'schedule-container',
        backend_url: 'url to backend',
        view: 'dayOccupation'
    }, options || {});

    this.initiateContainer();

    if(this.options.view == 'dayOccupation') {
        this.renderDayOccupation();
    } else if(this.options.view == 'weekOccupation') {
        this.renderWeekOccupation();
    }

}

IADAoccupationView.prototype.initiateContainer = function() {
    this.occupationContainer = $('#' + this.options.container);
    this.occupationContainer.append(this.getTemplateClone('occupationContainerTemplate').contents());
    this.occupationContainer.addClass('occupation-container');
}

IADAoccupationView.prototype.renderDayOccupation = function() {
	this.getEntities();
    console.debug(this.getColorForPercentage(11));
    this.bindWindowEvents();
}

IADAoccupationView.prototype.getEntities = function() {
	var occ = this;
	$.ajax({
        type: 'POST',
        url: this.options.backend_url  + '/entities',
        data: {

        }
    }).success(function(response) {
        occ.createRows(response);
    });
}

IADAoccupationView.prototype.createRows = function(response) {

    var daysInMonth = this.daysInMonth();
    var dayBlockWidth = 100.0 / daysInMonth;

    this.createHeader(daysInMonth, dayBlockWidth);

	for(ent_nr in response.entities) {
		var entity = response.entities[ent_nr];
		var entityRow = this.getTemplateClone('entityRowTemplate');
		entityRow.attr('id', 'entity_' + entity.id);
        entityRow.find('img.entity-icon').attr('src', entity.icon).css('border-color', entity.color);
        entityRow.find('p.entity-name').text(entity.name);
        entityRow.find('p.entity-name').attr('title', entity.name);
        this.occupationContainer.find('.entity-axis').append(entityRow);

        var occupationRow = this.getTemplateClone('occupationMatrixRowTemplate');
        occupationRow.attr('id', 'or_' + entity.id);

        for(var day = 1; day <= daysInMonth; day += 1) {
            var block = this.getTemplateClone('occupationMatrixBlockTemplate');
            block.addClass('day_' + day);
            block.css('width', dayBlockWidth + '%');
            occupationRow.append(block);
        }

        this.occupationContainer.find('.occupation-matrix-body').append(occupationRow);
	}
    this.resizeActions();
    this.fillColorsRandomly();
}

IADAoccupationView.prototype.createHeader = function(maxNr, blockWidth) {
    for(var day = 1; day <= maxNr; day += 1) {
        var block = this.getTemplateClone('dayAxisFrameTemplate');
        block.find('p.day').text(day);
        block.css('width', blockWidth + '%');
        this.occupationContainer.find('.day-axis').append(block);
    }
}

IADAoccupationView.prototype.resizeActions = function() {
    var newHeight = this.occupationContainer.find('.occupation-matrix-block').first().width();
    this.occupationContainer.find('.occupation-matrix-row').css('height', newHeight);
    this.occupationContainer.find('.entity-row').css('height', newHeight);

    // The percentage notation does not fit anymore, hide it
    if(newHeight < 30) {
        this.occupationContainer.find('.occupation-matrix-block p.percent').hide();
        this.occupationContainer.find('.entity-row img.entity-icon').hide();
    } else {
        this.occupationContainer.find('.occupation-matrix-block p.percent').show();
        this.occupationContainer.find('.entity-row img.entity-icon').show();
    }
}


IADAoccupationView.prototype.bindWindowEvents = function() {
    var occ = this;
    $(window).resize(function() {
        occ.resizeActions();
    });
}

IADAoccupationView.prototype.fillColorsRandomly = function() {
    occ = this;
    this.occupationContainer.find('.occupation-matrix-block').each(function() {
        var block = $(this);
        var percent = Math.random() * 100;
        console.debug(occ.getColorForPercentage(percent));
        block.css('background-color', occ.getColorForPercentage(percent));
        block.find('p.percent').text(Math.round(percent) + '%');
    });
}


IADAoccupationView.prototype.renderWeekOccupation = function() {
	alert('week');
}

IADAoccupationView.prototype.getTemplateClone = function(id) {
    var newitem = $('#occupation-templates').find('#' + id).clone();
    newitem.removeAttr('id');
    newitem.show();
    return newitem;
}

IADAoccupationView.prototype.daysInMonth = function() {
    return new Date(this.currentYear, this.currentMonth, 0).getDate();
}


IADAoccupationView.prototype.getColorForPercentage = function(pct) {
    pct = pct / 100.0
    var percentColors = [
        { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
        { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
        { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } } ];
    for (var i = 0; i < percentColors.length; i++) {
        if (pct <= percentColors[i].pct) {
            var lower = percentColors[i - 1];
            var upper = percentColors[i];
            var range = upper.pct - lower.pct;
            var rangePct = (pct - lower.pct) / range;
            var pctLower = 1 - rangePct;
            var pctUpper = rangePct;
            var color = {
                r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
                g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
                b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
            };
            return 'rgb(' + [color.r, color.g, color.b].join(',') + ', .4)';
            // or output as hex if preferred
        }
    }
}  