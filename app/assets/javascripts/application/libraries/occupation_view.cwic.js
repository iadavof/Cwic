function CwicOccupationView(options) {
  this.options = $.extend({
    container: 'schedule-container',
    view: 'dayOccupation'
  }, options || {});

  this.currentMonth = 0;
  this.currentYear = 0;
  this.occupationContainer = null;
  this.topAxis = null;
  this.controls = {};


  this.initiateContainer();
  this.renderOccupation();
}

CwicOccupationView.prototype.initiateContainer = function() {
  this.occupationContainer = $('#' + this.options.container);
  this.occupationContainer.append(APP.util.getTemplateClone('occupationContainerTemplate').contents());
  this.occupationContainer.addClass('occupation-container');
  this.topAxis = this.occupationContainer.find('div.top-axis');
  this.findControls();
  this.initStickyHeader();
};

CwicOccupationView.prototype.findControls = function() {
  this.controls = {
    date_current_month: localMenu.getButton('date_current_month'),
    date_current_year: localMenu.getButton('date_current_year')
  };
};

CwicOccupationView.prototype.initStickyHeader = function() {
  this.occupationContainer.find('div#sticky-header-content').cwicStickyHeader();
};

CwicOccupationView.prototype.renderOccupation = function() {
  var today = new Date();
  this.currentYear = today.getFullYear();

  if(this.options.view == 'dayOccupation') {
    this.currentMonth = today.getMonth() + 1;
  }

  this.getEntities();
  this.bindWindowEvents();
  this.bindControls();
};

CwicOccupationView.prototype.bindControls = function() {
  var occ = this;
  localMenu.getDivision('navigation').find('a.button').on('click', function() {
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

    occ.updateOccupationView();
  });

  $.merge(this.controls.date_current_month, this.controls.date_current_year).on('change', function() {
    occ.currentYear = parseInt(occ.controls.date_current_year.val());
    if(occ.options.view == 'dayOccupation') {
      occ.currentMonth = parseInt(occ.controls.date_current_month.val());
    }
    occ.updateOccupationView();
  });
};

CwicOccupationView.prototype.getBlockHref = function(entity, nr) {
  if(this.options.view == 'dayOccupation') {
    return Routes.organisation_schedule_view_horizontal_day_path(current_organisation) + '/entity/' + entity + '/' + this.currentYear + '/' + this.currentMonth + '/' + nr;
  } else {
    return Routes.organisation_schedule_view_horizontal_week_path(current_organisation) + '/entity/' + entity + '/' + this.currentYear + '/' + nr;
  }
};

CwicOccupationView.prototype.updateOccupationView = function() {
  this.topAxis.find('div.top-axis-frame').remove();
  var items, itemWidth;

  if(this.options.view == 'dayOccupation') {
    this.controls.date_current_month.select2('val', this.currentMonth);
    this.controls.date_current_year.select2('val', this.currentYear);
    this.topAxis.find('p.axis-part-name').text($.datepicker._defaults.monthNames[this.currentMonth-1] + ' ' + this.currentYear);
    items = this.daysInMonth();
  } else if(this.options.view == 'weekOccupation') {
    this.controls.date_current_year.select2('val', this.currentYear);
    this.topAxis.find('p.axis-part-name').text(this.currentYear);
    items = this.numberOfWeeksInYear(this.currentYear);
  }

  this.createHeader(items, 100.0 / items);
  this.generateMatrixBlocks(items, 100.0 / items);
  this.getOccupations();
};

CwicOccupationView.prototype.getEntities = function() {
  var occ = this;
  $.ajax({
    url: Routes.organisation_entities_path(current_organisation, { format: 'json' })
  }).success(function(response) {
    occ.createRows(response);
  });
};

CwicOccupationView.prototype.getBackendUrl = function() {
  if(this.options.view == 'dayOccupation') {
    return Routes.organisation_occupation_view_day_path(current_organisation, { format: 'json' });
  } else {
    return Routes.organisation_occupation_view_week_path(current_organisation, { format: 'json' });
  }
};

CwicOccupationView.prototype.getOccupations = function() {
  var occ = this;
  $.ajax({
    url: this.getBackendUrl(),
    data: {
      year: this.currentYear,
      month: this.currentMonth,
    },
  }).success(function(response) {
    occ.fillPercentages(response);
  });
};

CwicOccupationView.prototype.fillPercentages = function(response) {
  var occ = this;
  $.each(response.occupations, function(index, occupation) {
    occ.occupationContainer.find('.occupation-matrix-row#or_' + occupation.entity_id)
      .find('.occupation-matrix-block.nr_' + occupation.nr)
      .attr('title', occ.getBlockTitle(occupation.nr, occupation.percentage))
      .css('background-color', occ.getColorForPercentage(occupation.percentage, 0.4))
      .find('p.percent').text(Math.round(occupation.percentage) + '%');
  });
};

CwicOccupationView.prototype.getBlockTitle = function(nr, percent) {
  return (this.options.view == 'dayOccupation' ? jsLang.occupation_view.day : jsLang.occupation_view.week) + ' ' + nr + ': ' + Math.round(percent) + '%';
};

CwicOccupationView.prototype.createRows = function(response) {
  for(ent_nr in response.entities) {
    var entity = response.entities[ent_nr];
    var entityRow = APP.util.getTemplateClone('entityRowTemplate');
    entityRow.attr('id', 'entity_' + entity.id);
    entityRow.find('img.entity-icon').attr('src', entity.icon).css('border-color', entity.color);
    this.occupationContainer.find('.entity-axis').append(entityRow);

    var occupationRow = APP.util.getTemplateClone('occupationMatrixRowTemplate');
    occupationRow.attr('id', 'or_' + entity.id);
    occupationRow.data('entity-id', entity.id);

    var titleDiv = APP.util.getTemplateClone('entityRowTitleTemplate');
    titleDiv.find('p.entity-name').text(entity.name);
    this.occupationContainer.find('.occupation-matrix-body').append(titleDiv);

    this.occupationContainer.find('.occupation-matrix-body').append(occupationRow);
  }
  this.updateOccupationView();
  this.resizeActions();
};

CwicOccupationView.prototype.generateMatrixBlocks = function(maxNr, blockWidth) {
  var _this = this;
  var rows = this.occupationContainer.find('div.occupation-matrix-row');
  rows.find('a.occupation-matrix-block').remove();

  var zeroPercentColor = this.getColorForPercentage(0.0001, 0.1);
  rows.each(function() {
    var row = $(this), eid = row.data('entity-id');
    for(var i = 1; i <= maxNr; i += 1) {
      var block = APP.util.getTemplateClone('occupationMatrixBlockTemplate');
      block.addClass('nr_' + i);
      block.attr('href', _this.getBlockHref(eid, i));
      block.attr('title', _this.getBlockTitle(i, 0));
      block.css('width', blockWidth + '%');
      block.css('background-color', zeroPercentColor);
      row.append(block);
    }
  });
};

CwicOccupationView.prototype.createHeader = function(maxNr, blockWidth) {
  this.topAxis.find('.top-axis-frame').remove();
  for(var day = 1; day <= maxNr; day += 1) {
    var block = APP.util.getTemplateClone('topAxisFrameTemplate');
    block.find('p.nr').text(day);
    block.css('width', blockWidth + '%');
    this.topAxis.append(block);
  }
  this.resizeActions();
};

CwicOccupationView.prototype.resizeActions = function() {
  var newHeight = this.occupationContainer.find('.occupation-matrix-block').first().width();
  var row = this.occupationContainer.find('.occupation-matrix-row');
  row.css('height', newHeight);
  this.occupationContainer.find('.entity-row').css('height', row.outerHeight());

  if(newHeight < 25) {
    this.topAxis.find('div.top-axis-frame:nth-child(odd)').css('visibility', 'hidden');
  } else {
    this.topAxis.find('div.top-axis-frame').css('visibility', 'visible');
  }

  // The percentage notation does not fit anymore, hide it
  var dayAxisSticky;
  if(newHeight < 30) {
    // hide the entity axis and reuse the freed space
    this.occupationContainer.find('.occupation-matrix-block p.percent').hide();
    this.occupationContainer.find('.entity-axis').hide();
    // adjust width of day axis
    dayAxisSticky = this.occupationContainer.find('.cwic-sticky-container');
    dayAxisSticky.css('margin-left', '0');
    this.topAxis.css('margin-left', '0');
  } else {
    // make room for the entity axis and show it on the left side
    this.occupationContainer.find('.occupation-matrix-block p.percent').show();
    // Adjust the width of the day axis
    dayAxisSticky = this.occupationContainer.find('.cwic-sticky-container');
    dayAxisSticky.css('margin-left', '4%');
    this.topAxis.css('margin-left', '4%');
    this.occupationContainer.find('.entity-axis').show();
  }
};

CwicOccupationView.prototype.bindWindowEvents = function() {
  var occ = this;
  $(window).resize(function() {
    occ.resizeActions();
  });
};

CwicOccupationView.prototype.daysInMonth = function() {
  return new Date(this.currentYear, this.currentMonth, 0).getDate();
};

CwicOccupationView.prototype.getColorForPercentage = function(pct, alpha) {
  if(pct > 100) {
    pct = 100;
  }
  if(pct <= 0) {
    pct = 0.0001;
  }
  pct = pct / 100.0;
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
};

CwicOccupationView.prototype.numberOfWeeksInYear = function(year) {
  var fiftyThreeDaysInYears = [4, 9, 15, 20, 26, 32, 37, 43, 48, 54, 60, 65, 71, 76, 82, 88, 93, 99, 105, 111, 116, 122, 128, 133, 139, 144, 150, 156, 161, 167, 172, 178, 184, 189, 195, 201, 207, 212, 218, 224, 229, 235, 240, 246, 252, 257, 263, 268, 274, 280, 285, 291, 296, 303, 308, 314, 320, 325, 331, 336, 342, 348, 353, 359, 364, 370, 376, 381, 387, 392, 398];
  var mod400 = year % 400;
  if(fiftyThreeDaysInYears.indexOf(mod400) > 0) {
    return 53;
  } else return 52;
};
