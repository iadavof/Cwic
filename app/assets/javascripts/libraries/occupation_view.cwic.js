CwicOccupationView.prototype.options = null;
CwicOccupationView.prototype.currentMonth = 0;
CwicOccupationView.prototype.currentYear = 0;
CwicOccupationView.prototype.occupationContainer = null;

function CwicOccupationView(options) {
  this.options = $.extend({
    container: 'schedule-container',
    backend_url: 'url to backend',
    view: 'dayOccupation'
  }, options || {});

  this.initiateContainer();
  this.renderOccupation();
}

CwicOccupationView.prototype.initiateContainer = function() {
  this.occupationContainer = $('#' + this.options.container);
  this.occupationContainer.append(this.getTemplateClone('occupationContainerTemplate').contents());
  this.occupationContainer.addClass('occupation-container');

  this.occupationContainer.find('select').cwicControl('recreate');
}

CwicOccupationView.prototype.renderOccupation = function() {
  var today = new Date();
  this.currentYear = today.getFullYear();

  if(this.options.view == 'dayOccupation') {
    this.currentMonth = today.getMonth() + 1;
  }

  this.getEntities();
  this.bindWindowEvents();
  this.bindControls();
}

CwicOccupationView.prototype.bindControls = function() {
  var occ = this;

  if(this.options.view == 'weekOccupation') {
    this.occupationContainer.find('select#date_current_month, select#date_current_month + .dropdown').hide();
    this.occupationContainer.find('div.control-container a#current span.year').show();
  } else {
    this.occupationContainer.find('div.control-container a#current span.month').show();
  }

  this.occupationContainer.find('.control-container a.button').on('click', function() {
    if(this.id == 'previous') {
      if(occ.options.view == 'dayOccupation') {
        occ.currentMonth -= 1;
        if(occ.currentMonth <= 0) {
          occ.currentYear -= 1;
          occ.currentMonth = 12;
        }
      } else if(occ.options.view == 'weekOccupation') {
        occ.currentYear -=1;
      }
    } else if(this.id == 'current') {
      var now =  new Date();
      if(occ.options.view == 'dayOccupation') {
        occ.currentMonth = now.getMonth() + 1;
        occ.currentYear = now.getFullYear();
      } else if(occ.options.view == 'weekOccupation') {
        occ.currentYear = now.getFullYear();
      }
    } else if(this.id == 'next') {
      if(occ.options.view == 'dayOccupation') {
        occ.currentMonth += 1;
        if(occ.currentMonth >= 13) {
          occ.currentYear += 1;
          occ.currentMonth = 1;
        }
      } else if(occ.options.view == 'weekOccupation') {
        occ.currentYear += 1;
      }
    }

    // Only trigger a cwic dropdown change event
    occ.occupationContainer.find('select#date_current_year').val(occ.currentYear).trigger('change.cwicDropdown');
    occ.occupationContainer.find('select#date_current_month').val(occ.currentMonth).trigger('change.cwicDropdown');
    occ.updateOccupationView();
  });

  this.occupationContainer.find('div.control-container select').on('change', function() {
    occ.currentYear = parseInt(occ.occupationContainer.find('select#date_current_year').val());
    if(occ.options.view == 'dayOccupation') {
      occ.currentMonth = parseInt(occ.occupationContainer.find('select#date_current_month').val());
    }
    occ.updateOccupationView();
  });

  this.occupationContainer.on('click', 'div.occupation-matrix-block', function(){
    var block = $(this);
    var selEntity = block.parents('.occupation-matrix-row').data('entity-id');
    if(occ.options.view == 'dayOccupation') {
      window.location.href = occ.options.schedule_url + '/entity/' + selEntity + '/' + occ.currentYear + '/' + occ.currentMonth + '/' + block.data('nr');
    } else {
      window.location.href = occ.options.schedule_url + '/entity/' + selEntity + '/' + occ.currentYear + '/' + block.data('nr');
    }
  });

}

CwicOccupationView.prototype.updateOccupationView = function() {
  this.occupationContainer.find('div.top-axis div.top-axis-frame').remove();

  if(this.options.view == 'dayOccupation') {
    this.occupationContainer.find('select#date_current_month').val(this.currentMonth);
    this.occupationContainer.find('select#date_current_year').val(this.currentYear);
    this.occupationContainer.find('div.top-axis p.axis-part-name').text($.datepicker._defaults.monthNames[this.currentMonth-1] + ' ' + this.currentYear);

    var daysInMonth = this.daysInMonth();
    var dayBlockWidth = 100.0 / daysInMonth;

    this.createHeader(daysInMonth, dayBlockWidth);
    this.generateMatrixBlocks(daysInMonth, dayBlockWidth);
  } else if(this.options.view == 'weekOccupation') {
    this.occupationContainer.find('select#date_current_year').val(this.currentYear);
    this.occupationContainer.find('div.top-axis p.axis-part-name').text(this.currentYear);

    var weeksInYear = this.numberOfWeeksInYear(this.currentYear);
    var weekBlockWidth = 100.0 / weeksInYear;

    this.createHeader(weeksInYear, weekBlockWidth);
    this.generateMatrixBlocks(weeksInYear, weekBlockWidth);
  }

  this.getPercentages();
}


CwicOccupationView.prototype.getEntities = function() {
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

CwicOccupationView.prototype.getPercentages = function() {
  if(this.options.view == 'dayOccupation') {
    var url = this.options.backend_url + '/day_occupation_percentages.json';
    var data = {
      year: this.currentYear,
      month: this.currentMonth,
    }
  } else if(this.options.view == 'weekOccupation') {
    var url = this.options.backend_url + '/week_occupation_percentages.json';
    var data = {
      year: this.currentYear,
    }
  }

  var occ = this;
  $.ajax({
    type: 'POST',
    url: url,
    data: data,
  }).success(function(response) {
    occ.fillPercentages(response);
  });
}

CwicOccupationView.prototype.fillPercentages = function(response) {
  for(var ent_nr in response.entities) {
    var entity = response.entities[ent_nr].entity_id;
    if(this.options.view == 'dayOccupation') {
      var percentageItems = response.entities[ent_nr].days;
    } else {
      var percentageItems = response.entities[ent_nr].weeks;

    }
    for(var item_nr in percentageItems) {
      var item = percentageItems[item_nr];
      this.occupationContainer.find('.occupation-matrix-row#or_' + entity)
      .find('.occupation-matrix-block.nr_' + item.nr)
      .attr('title', jsLang.occupation_view.week + ' ' + item.nr + ': ' + Math.round(item.percent) + '%')
      .css('background-color', this.getColorForPercentage(item.percent, 0.4))
      .find('p.percent').text(Math.round(item.percent) + '%');
      this.occupationContainer;
    }
  }
}

CwicOccupationView.prototype.createRows = function(response) {

  for(ent_nr in response.entities) {
    var entity = response.entities[ent_nr];
    var entityRow = this.getTemplateClone('entityRowTemplate');
    entityRow.attr('id', 'entity_' + entity.id);
    entityRow.find('img.entity-icon').attr('src', entity.icon).css('border-color', entity.color);
    this.occupationContainer.find('.entity-axis').append(entityRow);

    var occupationRow = this.getTemplateClone('occupationMatrixRowTemplate');
    occupationRow.attr('id', 'or_' + entity.id);
    occupationRow.data('entity-id', entity.id);

    var titleDiv = this.getTemplateClone('entityRowTitleTemplate');
    titleDiv.find('p.entity-name').text(entity.name);
    this.occupationContainer.find('.occupation-matrix-body').append(titleDiv);

    this.occupationContainer.find('.occupation-matrix-body').append(occupationRow);
  }
  this.updateOccupationView();
  this.resizeActions();
}

CwicOccupationView.prototype.generateMatrixBlocks = function(maxNr, blockWidth) {
  var rows = this.occupationContainer.find('div.occupation-matrix-row');
  rows.find('div.occupation-matrix-block').remove();

  var zeroPercentColor = this.getColorForPercentage(0.0001, 0.1);

  for(var i = 1; i <= maxNr; i += 1) {
    var block = this.getTemplateClone('occupationMatrixBlockTemplate');
    block.addClass('nr_' + i);
    block.data('nr', i);
    block.attr('title', jsLang.occupation_view.week + ' ' + i + ': 0%');
    block.css('width', blockWidth + '%');
    block.css('background-color', zeroPercentColor);
    rows.append(block);
  }
}

CwicOccupationView.prototype.createHeader = function(maxNr, blockWidth) {
  var topAxis = this.occupationContainer.find('div.top-axis');
  topAxis.find('.top-axis-frame').remove();
  for(var day = 1; day <= maxNr; day += 1) {
    var block = this.getTemplateClone('topAxisFrameTemplate');
    block.find('p.nr').text(day);
    block.css('width', blockWidth + '%');
    topAxis.append(block);
  }
  if(!topAxis.parent().hasClass('sticky-container')) {
    topAxis.cwicStickyHeader();
  }
  this.resizeActions();
}

CwicOccupationView.prototype.resizeActions = function() {
  var newHeight = this.occupationContainer.find('.occupation-matrix-block').first().width();
  var row = this.occupationContainer.find('.occupation-matrix-row')
  row.css('height', newHeight);
  this.occupationContainer.find('.entity-row').css('height', row.outerHeight());

  if(newHeight < 25) {
    this.occupationContainer.find('div.top-axis-frame:nth-child(odd)').css('visibility', 'hidden');
  } else {
    this.occupationContainer.find('div.top-axis-frame').css('visibility', 'visible');
  }


  // The percentage notation does not fit anymore, hide it
  if(newHeight < 30) {
    // hide the entity axis and reuse the freed space
    this.occupationContainer.find('.occupation-matrix-block p.percent').hide();
    this.occupationContainer.find('.entity-axis').hide();
    // adjust width of day axis
    var dayAxisSticky = this.occupationContainer.find('.cwic-sticky-container')
    dayAxisSticky.css('margin-left', '0');
  } else {
    // make room for the entity axis and show it on the left side
    this.occupationContainer.find('.occupation-matrix-block p.percent').show();
    // Adjust the width of the day axis
    var dayAxisSticky = this.occupationContainer.find('.cwic-sticky-container')
    dayAxisSticky.css('margin-left', '4%');
    this.occupationContainer.find('.entity-axis').show();
  }
}


CwicOccupationView.prototype.bindWindowEvents = function() {
  var occ = this;
  $(window).resize(function() {
    occ.resizeActions();
  });
}

CwicOccupationView.prototype.getTemplateClone = function(id) {
  var newitem = $('#occupation-templates').find('#' + id).clone();
  newitem.removeAttr('id');
  newitem.show();
  return newitem;
}

CwicOccupationView.prototype.daysInMonth = function() {
  return new Date(this.currentYear, this.currentMonth, 0).getDate();
}


CwicOccupationView.prototype.getColorForPercentage = function(pct, alpha) {
  if(pct > 100) {
    pct = 100;
  }
  if(pct <= 0) {
    pct = 0.0001;
  }
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

CwicOccupationView.prototype.numberOfWeeksInYear = function(year) {
  var fiftyThreeDaysInYears = [4, 9, 15, 20, 26, 32, 37, 43, 48, 54, 60, 65, 71, 76, 82, 88, 93, 99, 105, 111, 116, 122, 128, 133, 139, 144, 150, 156, 161, 167, 172, 178, 184, 189, 195, 201, 207, 212, 218, 224, 229, 235, 240, 246, 252, 257, 263, 268, 274, 280, 285, 291, 296, 303, 308, 314, 320, 325, 331, 336, 342, 348, 353, 359, 364, 370, 376, 381, 387, 392, 398];
  var mod400 = year % 400;
  if(fiftyThreeDaysInYears.indexOf(mod400) > 0) {
    return 53;
  } else return 52;
}
