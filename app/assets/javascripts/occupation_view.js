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
    this.bindWindowEvents();
    this.bindControls();
}

IADAoccupationView.prototype.bindControls = function() {
    var occ = this;
    this.occupationContainer.find('.control-container a.button').on('click', function() {
        if(this.id == 'previous') {
            if(occ.options.view == 'dayOccupation') {
                occ.currentMonth -= 1;
                if(occ.currentMonth <= 0) {
                    occ.currentYear -= 1;
                    occ.currentMonth = 12;
                }
            } else if(occ.options.view == 'weekOccupation') {

            }
        } else if(this.id == 'current') {
            if(occ.options.view == 'dayOccupation') {
                var now =  new Date();
                occ.currentMonth = now.getMonth() + 1;
                occ.currentYear = now.getFullYear();
            } else if(this.options.view == 'weekOccupation') {

            }
        } else if(this.id == 'next') {
            if(occ.options.view == 'dayOccupation') {
                occ.currentMonth += 1;
                if(occ.currentMonth >= 13) {
                    occ.currentYear += 1;
                    occ.currentMonth = 1;
                }
            } else if(this.options.view == 'weekOccupation') {

            }
        } else if(this.id == 'occupationDateUpdate') {
            if(occ.options.view == 'dayOccupation') {
                occ.currentMonth = parseInt($('select#date_current_month').val());
                occ.currentYear = parseInt($('select#date_current_year').val());
            } else if(occ.options.view == 'weekOccupation') {

            }
        }
        occ.updateOccupationView();
    });
}

IADAoccupationView.prototype.updateOccupationView = function() {
    this.occupationContainer.find('select#date_current_month').val(this.currentMonth);
    this.occupationContainer.find('select#date_current_year').val(this.currentYear);
    this.occupationContainer.find('div.day-axis p.month-name').text($.datepicker._defaults.monthNames[this.currentMonth-1] + ' ' + this.currentYear);

    this.occupationContainer.find('div.day-axis div.day-axis-frame').remove();

    var daysInMonth = this.daysInMonth();
    var dayBlockWidth = 100.0 / daysInMonth;

    this.createHeader(daysInMonth, dayBlockWidth);
    this.generateMatrixBlocks(daysInMonth, dayBlockWidth);

    //this.fillColorsRandomly();
    this.getPercentages();
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

IADAoccupationView.prototype.getPercentages = function() {
    var occ = this;
    $.ajax({
        type: 'POST',
        url: this.options.backend_url  + '/day_occupation_percentages',
        data: {
            month: this.currentMonth,
            year: this.currentYear,
        }
    }).success(function(response) {
        occ.fillPercentages(response);
    });
}

IADAoccupationView.prototype.fillPercentages = function(response) {
    for(var ent_nr in response.entities) {
        var entity = response.entities[ent_nr].entity_id;
        for(var item_nr in response.entities[ent_nr].days) {
            var day = response.entities[ent_nr].days[item_nr];
            this.occupationContainer.find('occupation-matrix-row#or' + entity)
            .find('.occupation-matrix-row.day_' + day.day_nr).css('background-color', this.getColorForPercentage(day.percent, 0.4))
            .find('p.percent').text(Math.round(day.percent) + '%');
        }
    }
}

IADAoccupationView.prototype.createRows = function(response) {

	for(ent_nr in response.entities) {
		var entity = response.entities[ent_nr];
		var entityRow = this.getTemplateClone('entityRowTemplate');
		entityRow.attr('id', 'entity_' + entity.id);
        entityRow.find('img.entity-icon').attr('src', entity.icon).css('border-color', entity.color);
        this.occupationContainer.find('.entity-axis').append(entityRow);

        var occupationRow = this.getTemplateClone('occupationMatrixRowTemplate');
        occupationRow.attr('id', 'or_' + entity.id);

        var titleDiv = this.getTemplateClone('entityRowTitleTemplate');
        titleDiv.find('p.entity-name').text(entity.name);
        this.occupationContainer.find('.occupation-matrix-body').append(titleDiv);

        this.occupationContainer.find('.occupation-matrix-body').append(occupationRow);
	}
    this.updateOccupationView();
    this.resizeActions();
}

IADAoccupationView.prototype.generateMatrixBlocks = function(maxNr, blockWidth) {
    var rows = this.occupationContainer.find('div.occupation-matrix-row');
    rows.find('div.occupation-matrix-block').remove();

    var zeroPercentColor = this.getColorForPercentage(0.0001, 0.1);

    for(var i = 1; i <= maxNr; i += 1) {
        var block = this.getTemplateClone('occupationMatrixBlockTemplate');
        block.addClass('day_' + i);
        block.css('width', blockWidth + '%');
        block.css('background-color', zeroPercentColor);
        rows.append(block);
    }
}

IADAoccupationView.prototype.createHeader = function(maxNr, blockWidth) {
    var dayAxis = this.occupationContainer.find('div.day-axis');
    dayAxis.find('day-axis-frame').remove();
    for(var day = 1; day <= maxNr; day += 1) {
        var block = this.getTemplateClone('dayAxisFrameTemplate');
        block.find('p.day').text(day);
        block.css('width', blockWidth + '%');
        dayAxis.append(block);
    }
    dayAxis.sticky({getWidthFrom: '.occupation-matrix-body'});
}

IADAoccupationView.prototype.resizeActions = function() {
    var newHeight = this.occupationContainer.find('.occupation-matrix-block').first().width();
    this.occupationContainer.find('.occupation-matrix-row').css('height', newHeight);
    this.occupationContainer.find('.entity-row').css('height', newHeight);

    // The percentage notation does not fit anymore, hide it
    if(newHeight < 30) {
        // hide the entity axis and reuse the freed space
        this.occupationContainer.find('.occupation-matrix-block p.percent').hide();
        this.occupationContainer.find('.entity-axis').hide();
        this.occupationContainer.find('.occupation-matrix-body').css('width', '100%');
        // adjust width of day axis
        var dayAxis = this.occupationContainer.find('.day-axis')
        dayAxis.css('margin-left', '0');
        dayAxis.css('width', '100%');
    } else {
        // make room for the entity axis and show it on the left side
        this.occupationContainer.find('.occupation-matrix-body').css('width', '96%');
        this.occupationContainer.find('.occupation-matrix-block p.percent').show();
        // Adjust the width of the day axis
        var dayAxis = this.occupationContainer.find('.day-axis')
        dayAxis.css('margin-left', '4%');
        dayAxis.css('width', '96%');
        this.occupationContainer.find('.entity-axis').show();
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
        block.css('background-color', occ.getColorForPercentage(percent, 0.4));
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


IADAoccupationView.prototype.getColorForPercentage = function(pct, alpha) {
    pct = pct / 100.0
    var percentColors = [
        { pct: 0.0, color: { r: 0x00, g: 0xff, b: 0 } },
        { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
        { pct: 1.0, color: { r: 0xff, g: 0x00, b: 0 } } ];
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
            return 'rgb(' + [color.r, color.g, color.b].join(',') + ', '+ alpha +')';
            // or output as hex if preferred
        }
    }
}