APP.schedule_view = {
  init: function() {
    var dateOptions = { showOn: 'both' };
    var timeOptions = { showPeriodLabels: false, showOn: 'both' };
    $('#begins_at_date').datepicker(dateOptions);
    $('#begins_at_time').timepicker(timeOptions);
    $('#ends_at_date').datepicker(dateOptions);
    $('#ends_at_time').timepicker(timeOptions);
  },
  horizontal_calendar: function() {
    new IADAscheduleView({
      container: 'horizontal-calendar',
      backend_url: Routes.organisation_schedule_view_index_path(current_organisation),
      view: 'horizontalCalendar'
    });
  },
  today_and_tomorrow: function() {
    new IADAscheduleView({
      container: 'horizontal-calendar',
      backend_url: Routes.organisation_schedule_view_index_path(current_organisation),
      view: 'horizontalCalendar'
    });
  }
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

IADAscheduleView.prototype.scheduleContainer = null;
IADAscheduleView.prototype.scheduleObjects = null;
IADAscheduleView.prototype.selectedEntities = [];
IADAscheduleView.prototype.options = null;
IADAscheduleView.prototype.beginDate = null;
IADAscheduleView.prototype.endDate = null;
IADAscheduleView.prototype.needleTimeout = null;
IADAscheduleView.prototype.currentMode = 'week';

function IADAscheduleView(options) {
  this.options = Object.extend({
    container: 'schedule-container',
    backend_url: 'url to backend',
    view: 'horizontalCalendar'
  }, options || {});

  if(this.options.view == 'horizontalCalendar') {
    this.renderHorizontalCalendar();
  } else if(this.options.view == 'todayAndTomorrow') {
    this.renderTodayAndTomorrow();
  }
}

IADAscheduleView.prototype.renderHorizontalCalendar = function () {
  this.initScheduleStub();

  this.createEntityShowCase();
  this.bindControls();
  this.addTimeAxis();
}

IADAscheduleView.prototype.initScheduleStub = function() {
  var week = this.startAndEndOfWeek();
  this.beginDate = week[0];
  this.endDate = week[1];
  this.scheduleContainer = $('#' + this.options.container);
  this.scheduleContainer.append(this.getTemplateClone('scheduleContainerTemplate').contents());
  this.scheduleContainer.addClass('horizontal-calendar');
}

IADAscheduleView.prototype.toggleEntity = function(entity_button) {
  var id = parseInt($(entity_button).attr('id').split('_')[1]);

  if($(entity_button).hasClass('active')) {
    $(entity_button).removeClass('active').css({'border-color': '', 'border-bottom-color': $(entity_button).data('entity-color')});
    this.selectedEntities.splice($.inArray(id, this.selectedEntities), 1);
  } else {
    $(entity_button).addClass('active').css('border-color', $(entity_button).data('entity-color'));
    this.selectedEntities.push(id);
  }

  if(typeof(Storage) !== 'undefined') {
    localStorage.previouslySelectedEntities = this.selectedEntities;
  }

  this.updateSchedule();
}

IADAscheduleView.prototype.toggleEntities = function(on) {
  schedule = this;
  if(on) {
    this.scheduleContainer.find('.entity-container .entity-button').each(function() {
      $(this).addClass('active').css('border-color', $(this).data('entity-color'));
      schedule.selectedEntities.push(this.id.split('_')[1]);
    });
  } else {
    this.scheduleContainer.find('.entity-container .entity-button').each(function() {
      $(this).removeClass('active').css({'border-color': '', 'border-bottom-color': $(this).data('entity-color')});
    });
    this.selectedEntities = [];
  }

  if(typeof(Storage) !== 'undefined') {
    localStorage.previouslySelectedEntities = this.selectedEntities;
  }

  this.updateSchedule();
}

IADAscheduleView.prototype.createEntityShowCase = function() {
  var schedule = this;

  this.scheduleContainer.find('.entity-container a#selectAll').on('click', function(e){e.preventDefault(); schedule.toggleEntities(true); return false;});
  this.scheduleContainer.find('.entity-container a#selectNone').on('click', function(e){e.preventDefault(); schedule.toggleEntities(false); return false;});

  $.ajax({
    type: 'POST',
    url: this.options.backend_url  + '/entities',
    data: {

    }
  }).success(function(response) {
    schedule.afterEntitiesLoad(response);
  });
};

IADAscheduleView.prototype.bindControls = function() {
  var schedule = this;
  this.scheduleContainer.find('#scheduleBeginDate').datepicker({showOn: 'both', altField: '#backendBeginDate', altFormat: 'yy-mm-dd'}).datepicker("setDate", new Date(this.beginDate));
  this.scheduleContainer.find('#scheduleEndDate').datepicker({showOn: 'both', altField: '#backendEndDate', altFormat: 'yy-mm-dd'}).datepicker("setDate", new Date(this.endDate));
  this.scheduleContainer.find('#scheduleDateUpdate').click(function(){schedule.setDateDomain();});

  var navigation = this.scheduleContainer.find('.control-container.navigate');
  navigation.find('.button').on('click', function () {
    var beginEnd = null;

    var begin_date = schedule.dateToFirstMSec(schedule.beginDate);
    var end_date = schedule.dateToFirstMSec(schedule.endDate);

    if(this.id == 'dayMode') {
      if(schedule.currentMode == 'day') {
        return;
      }
      if(schedule.currentMode == 'week') {
        beginEnd = schedule.startAndEndOfWeek(new Date(begin_date));
      } else if (schedule.currentMode == 'month') {
        beginEnd = schedule.startAndEndOfMonth(new Date(begin_date));
      }
      today = schedule.dateToFirstMSec(new Date());
      if(Date.parse(beginEnd[0]) < today && today < Date.parse(beginEnd[1])) {
        beginEnd[0] = beginEnd[1] = new Date(today).customFormat('#YYYY#-#MM#-#DD#');
      } else {
        beginEnd[0] = beginEnd[1] = schedule.beginDate;
      }
      schedule.currentMode = 'day';
    }

    if(this.id == 'weekMode') {
      if(schedule.currentMode == 'week') {
        return;
      }
      if(schedule.currentMode == 'day') {
        beginEnd = schedule.startAndEndOfWeek(new Date(begin_date));
      } else if (schedule.currentMode == 'month') {
        beginEnd = schedule.startAndEndOfMonth(new Date(begin_date));
        today = schedule.dateToFirstMSec(new Date());
        if(Date.parse(beginEnd[0]) < today && today < Date.parse(beginEnd[1])) {
          beginEnd = schedule.startAndEndOfWeek(new Date(today));
        } else {
          beginEnd = schedule.startAndEndOfWeek(new Date(begin_date));
        }
      }
      schedule.currentMode = 'week';
    }

    if(this.id == 'monthMode') {
      if(schedule.currentMode == 'month') {
        return;
      }
      beginEnd = schedule.startAndEndOfMonth(new Date(begin_date));
      schedule.currentMode = 'month';
    }

    if(this.id == 'previous') {
      if(schedule.currentMode == 'day') {
        var newDate = new Date(begin_date - 1).customFormat('#YYYY#-#MM#-#DD#');
        beginEnd = [newDate, newDate];
      } else if(schedule.currentMode == 'week') {
        beginEnd = schedule.startAndEndOfWeek(new Date(begin_date - 1));
      } else if(schedule.currentMode == 'month') {
        beginEnd = schedule.startAndEndOfMonth(new Date(begin_date), -1);
      }
    }

    if(this.id == 'next') {
      if(schedule.currentMode == 'day') {
        var newDate = new Date(end_date + 24 * 3600000).customFormat('#YYYY#-#MM#-#DD#');
        beginEnd = [newDate, newDate];
      } else if(schedule.currentMode == 'week') {
        beginEnd = schedule.startAndEndOfWeek(new Date(end_date + 24 * 3600000));
      } else if(schedule.currentMode == 'month') {
        beginEnd = schedule.startAndEndOfMonth(new Date(begin_date), 1);
      }
    }

    if(this.id == 'current') {
      if(schedule.currentMode == 'day') {
        var newDate = new Date().customFormat('#YYYY#-#MM#-#DD#');
        beginEnd = [newDate, newDate];
      } else if(schedule.currentMode == 'week') {
        beginEnd = schedule.startAndEndOfWeek();
      } else if(schedule.currentMode == 'month') {
        beginEnd = schedule.startAndEndOfMonth();
      }
    }

    if(beginEnd != null) {
      schedule.beginDate = beginEnd[0];
      schedule.endDate = beginEnd[1];
      schedule.updateDateDomainControl();
      schedule.updateSchedule();
    }
  });

  this.bindNewReservationControls();
}

IADAscheduleView.prototype.updateDateDomainControl = function() {
  this.scheduleContainer.find('#scheduleBeginDate').datepicker("setDate", new Date(this.beginDate));
  this.scheduleContainer.find('#scheduleEndDate').datepicker("setDate", new Date(this.endDate));
}

IADAscheduleView.prototype.bindNewReservationControls = function() {
  var newScheduleItem = null;
  var newItem = {};
  var scheduleview = this;
  this.scheduleContainer.find('.schedule-body').on('mousedown', '.day-row-schedule-object-item-parts', function(event) {
    if(newScheduleItem == null) {
      newScheduleItem = scheduleview.getTemplateClone('scheduleItemTemplate');
      var offset = $(this).offset();
      var relX = event.pageX - offset.left;
      newItem.end_date = newItem.begin_date = new Date(parseInt($(this).closest('.day-row').attr('id')));
      newItem.schedule_object_id = parseInt(event.target.id.split('_')[1]);
      newItem.end_time = newItem.begin_time = scheduleview.nearestTimePoint(relX, $(this).width());
      newScheduleItem.css('left', + scheduleview.dayTimeToPercentage(newItem.begin_time) + '%');
      $(this).append(newScheduleItem);
    }
  });

  this.scheduleContainer.find('.schedule-body').on('mousemove', '.day-row-schedule-object-item-parts', function(event) {
    var offset = $(this).offset();
    var relX = event.pageX - offset.left;
    if(newScheduleItem != null) {
      newItem.end_time = scheduleview.nearestTimePoint(relX, $(this).width());
      newScheduleItem.css('width', + scheduleview.dayTimePercentageSpan(newItem.begin_time, newItem.end_time) + '%');
    }
  });
  this.scheduleContainer.find('.schedule-body').on('mouseup', function() {
    // Handle new entry
    if(newScheduleItem != null && newItem.begin_time < newItem.end_time) {
      schedule.setNewReservationForm(newItem);
      window.location.hash = '#new_reservation';
      $('#new_reservation_popup').find('a.close').on('click', function() {
        if(newScheduleItem != null) {
          newScheduleItem.remove();
          newScheduleItem = null;
        }
      });
    } else {
      if(newScheduleItem != null) {
        newScheduleItem.remove();
        newScheduleItem = null;
      }
    }
  });
}

IADAscheduleView.prototype.setNewReservationForm = function(item) {
  var reservationForm = $('#new_reservation_popup');
  reservationForm.find('input#begins_at_date').datepicker("setDate", item.begin_date);
  reservationForm.find('input#begins_at_time').timepicker("setTime", item.begin_time);
  if(item.end_time == '24:00') {
    item.end_date.setDate(item.end_date.getDate() + 1); // Increase day by one
    item.end_time = '00:00'; // And set time to 00:00
  }
  reservationForm.find('input#ends_at_date').datepicker("setDate", item.end_date);
  reservationForm.find('input#ends_at_time').timepicker("setTime", item.end_time);
  reservationForm.find('select#reservation_entity_id').val(item.schedule_object_id);
}

IADAscheduleView.prototype.nearestTimePoint = function(relX, parentWidth) {
  var steps = 48; // Half hour steps
  var step = parentWidth / steps;
  var fullsteps = Math.round(relX / step);
  var stepMinutes = 24 * 60 / steps;
  var nearestTimeMinutes = fullsteps * stepMinutes;
  return ((Math.floor(nearestTimeMinutes / 60) < 10) ? '0' : '') + Math.floor(nearestTimeMinutes / 60) + ':' + ((Math.floor(nearestTimeMinutes % 60) < 10) ? '0' : '') + nearestTimeMinutes % 60;
}

IADAscheduleView.prototype.setDateDomain = function() {
  var container  = $(this.scheduleContainer);
  var beginDateField = container.find('#backendBeginDate');
  var endDateField = container.find('#backendEndDate');

  // Check if entered endDate is bigger than the entered beginDate
  if(Date.parse(endDateField.val()) < Date.parse(beginDateField.val())) {
    this.setErrorField(container.find('#scheduleEndDate'), true);
    return;
  } else {
    this.setErrorField(container.find('#scheduleEndDate'), false);
  }

  this.beginDate = container.find('#backendBeginDate').val();
  this.endDate = container.find('#backendEndDate').val();
  this.updateSchedule();
}

IADAscheduleView.prototype.setErrorField =  function(field, error) {
  if(field.parent().hasClass('field_with_errors')) {
    field.unwrap();
  }
  if(error) {
    field.wrap($('<div>', {class: 'field_with_errors'}));
  }
}

IADAscheduleView.prototype.afterEntitiesLoad = function(response) {
  this.entities = response.entities;
  for(var entnr in response.entities) {
    var entity = response.entities[entnr];
    var jentity = this.getTemplateClone('entityButtonTemplate');
    jentity.attr('id', 'entity_'+ entity.id).css('border-bottom-color', entity.color).data('entity-color', entity.color);
    jentity.find('.entity-name').text(entity.name);
    jentity.find('img.entity-icon').attr('src', entity.icon);

    if(typeof(Storage) !== 'undefined' && typeof(localStorage.previouslySelectedEntities) !== 'undefined') {
      if(localStorage.previouslySelectedEntities.indexOf(entity.id) > -1) {
        this.selectedEntities.push(entity.id);
        jentity.addClass('active').css('border-color', entity.color);
      }
    }

    var schedule = this;
    jentity.on('click', function() {schedule.toggleEntity(this);});

    $(this.scheduleContainer).find('.entity-container').append(jentity);

  }
  if(response.entities.length <= 0) {
    this.scheduleContainer.find('.entity-container p.no_entities_found').show();
    this.scheduleContainer.find('.entity-container div.fast-select').hide();

    // Ook de button voor het aanmaken van een nieuwe reservering uitschakelen (hoewel dit eigenlijk een beetje abstractiebreuk is aangezien dit buiten de schedule container zit).
    $('a.button.new-reservation').hide();
  }
  this.updateSchedule();
}

IADAscheduleView.prototype.addTimeAxis = function() {
  var timeAxis = $(this.scheduleContainer).find('.time-axis');

  for(var i = 1; i < 24; i += 1) {
    var hourpart = this.getTemplateClone('hourTimeAxisFrameTemplate');
    $(hourpart).attr('id', 'hour_'+ i).find('p.time').text(i);
    $(timeAxis).append(hourpart);
  }

  timeAxis.sticky({getWidthFrom: '.schedule-body'});
}

IADAscheduleView.prototype.createSchedule = function() {
  var days = this.getDatesBetween(Date.parse(this.beginDate), Date.parse(this.endDate));

  for(var daynr in days) {
    this.appendDay(days[daynr]);
    if(days[daynr].date == new Date().setHours(0,0,0,0)) {
      this.showCurrentDayTimeNeedle();
    }
  }
  this.scheduleContainer.find('.schedule-body').css('height', 'auto');

}

IADAscheduleView.prototype.loadScheduleObjects = function() {
  if(this.selectedEntities.length > 0) {
    schedule = this;

    $.ajax({
      type: 'POST',
      url: this.options.backend_url  + '/index_domain',
      data: {
        entity_ids: this.selectedEntities.join(','),
        schedule_begin: this.beginDate,
        schedule_end: this.endDate,
      }
    }).success(function(response) {
      schedule.afterScheduleObjectsLoad(response);
    });
  }
}

IADAscheduleView.prototype.clearSchedule = function() {
  if(this.needleTimeout != null) {
     clearTimeout(this.needleTimeout);
  }
  var scheduleBody = this.scheduleContainer.find('.schedule-body');
  scheduleBody.css('height', scheduleBody.height());
  scheduleBody.html('');
  this.scheduleContainer.find('.day-axis').html('');
}

IADAscheduleView.prototype.updateSchedule = function() {
  this.clearSchedule();
  if(this.selectedEntities.length > 0) {
    this.loadScheduleObjects();
    this.scheduleContainer.find('.schedule-body .disabled-overlay').remove();
  } else {
    this.createSchedule();
    this.disabledOverlay();
  }
}

IADAscheduleView.prototype.disabledOverlay = function() {
  this.scheduleContainer.find('.schedule-body').append($('<div></div>', {class: 'disabled-overlay', text: 'Geen objecten geselecteerd.'})); //I18n T TODO
}

IADAscheduleView.prototype.afterScheduleObjectsLoad = function(response) {
  this.scheduleObjects = response.schedule_objects;
  this.beginDate = response.begin_date;
  this.endDate = response.end_date;

  this.createSchedule();
  this.initDayRowScheduleObjectRows();
  this.addAllScheduleItems();
}

IADAscheduleView.prototype.initDayRowScheduleObjectRows = function() {
  for(var schi in this.scheduleObjects) {
    var schobject = this.scheduleObjects[schi];
    var newSchObjItemParts = this.getTemplateClone('dayRowScheduleObjectItemPartsTemplate');
    newSchObjItemParts.attr('id', 'scheduleObject_' + schobject.schedule_object_id);
    newSchObjItemParts.find('p.name').text(schobject.schedule_object_name);
    $(this.scheduleContainer).find('.day-row .day-row-schedule-objects').append(newSchObjItemParts);
  }
  if(this.scheduleObjects != null) {
    if(this.scheduleObjects.length == 1) {
      $('.day-row-schedule-object-item-parts').css('height', '60px');
    } else if(this.scheduleObjects.length == 2) {
      $('.day-row-schedule-object-item-parts').css('height', '30px');
    } else {
      $('.day-row-schedule-object-item-parts').css('height', '20px');
      $('.day-axis .day-axis-row:not(.today)').height($('.day-row:not(.today)').outerHeight());
      $('.day-axis .day-axis-row.today').height($('.day-row.today').outerHeight());
    }
  }
}

IADAscheduleView.prototype.addAllScheduleItems = function() {
  for(var schoi in this.scheduleObjects) {
    var schobject = this.scheduleObjects[schoi];
    for(var schi in schobject.items) {
      this.addScheduleItem(schobject.items[schi], schobject.schedule_object_id);
    }
  }
}

IADAscheduleView.prototype.addScheduleItem = function(item, schedule_object_id) {
  if(item.begin_date == item.end_date) {
    var beginDate = this.dateToFirstMSec(item.begin_date);
    this.addSingleDayItem($(this.scheduleContainer).find('#'+ beginDate), item, schedule_object_id);
  } else {
    var beginDate = this.dateToFirstMSec(item.begin_date);
    var endDate = this.dateToFirstMSec(item.end_date);
    var days = this.getDatesBetween(beginDate, endDate);
    for(var dayi = 0; dayi < days.length; dayi += 1) {
      switch(dayi) {
        case 0:
          var schedulePart = this.addSingleDayBlock($(this.scheduleContainer).find('#'+ days[dayi].date), item.begin_time, '24:00', item, schedule_object_id);
          schedulePart.find('div.continue.right').show();
          break;
        case days.length - 1:
          var schedulePart = this.addSingleDayBlock($(this.scheduleContainer).find('#'+ days[dayi].date), '00:00', item.end_time, item, schedule_object_id);
          schedulePart.find('div.continue.left').show();
          break;
        default:
          var schedulePart = this.addSingleDayBlock($(this.scheduleContainer).find('#'+ days[dayi].date), '00:00', '24:00', item, schedule_object_id);
          schedulePart.find('div.continue').show();
      }
    }
  }
}

IADAscheduleView.prototype.dateToFirstMSec = function (date) {
  var ret = new Date(Date.parse(date));
  ret.setHours(0,0,0,0);
  ret = ret.getTime();
  return ret;
}

IADAscheduleView.prototype.addSingleDayBlock = function(dayRowScheduleRow, begin_time, end_time, item, schedule_object_id) {
  var newScheduleItem = this.getTemplateClone('scheduleItemTemplate');
  newScheduleItem.css('left', + this.dayTimeToPercentage(begin_time) + '%');
  newScheduleItem.css('width', + this.dayTimePercentageSpan(begin_time, end_time) + '%');
  newScheduleItem.css('background-color', item.bg_color);
  newScheduleItem.css('color', item.text_color);

  var newScheduleItemText = newScheduleItem.find('a.item-text');
  if(item.show_url) {
    newScheduleItemText.attr('href', item.show_url);
  }
  newScheduleItemText.text(item.description);
  newScheduleItemText.attr('title', item.description);
  newScheduleItemText.css('color', item.text_color);
  $(dayRowScheduleRow).find('#scheduleObject_' + schedule_object_id).append(newScheduleItem);
  return newScheduleItem;
}

IADAscheduleView.prototype.addSingleDayItem = function(dayRowScheduleRow, item, schedule_object_id) {
  this.addSingleDayBlock(dayRowScheduleRow, item.begin_time, item.end_time, item, schedule_object_id);
}

IADAscheduleView.prototype.dayTimePercentageSpan = function(begintime, endtime) {
  var hours = parseInt(endtime.split(':')[0]) - parseInt(begintime.split(':')[0]);
  var minutes = parseInt(endtime.split(':')[1]) - parseInt(begintime.split(':')[1]);
  return (hours * 60 + minutes) / 14.4;
}

IADAscheduleView.prototype.dayTimeToPercentage = function(time) {
  var hours = parseInt(time.split(':')[0]);
  var minutes = parseInt(time.split(':')[1]);
  return (hours * 60 + minutes) / 14.4;
}

IADAscheduleView.prototype.getTemplateClone = function(id) {
  var newitem = $('#schedule-templates').find('#' + id).clone();
  newitem.removeAttr('id');
  newitem.show();
  return newitem;
}

IADAscheduleView.prototype.getDatesBetween = function(begin, end) {
  begin = new Date(begin).setHours(0,0,0,0);
  end = new Date(end).setHours(0,0,0,0);
  var days = [];
  for(var daynr = 0; daynr <= Math.floor((end-begin) / (3600000*24)); daynr += 1) {
    var newday = new Date(begin + (daynr * 3600000 * 24));
    days.push({date: newday.getTime(), name: this.formatDate(newday)});
  }
  return days;
}

IADAscheduleView.prototype.appendDay = function(day) {
  var dayAxisDiv = this.getTemplateClone('dayAxisRowTemplate');
  dayAxisDiv.attr('id', 'label_' + day.date);
  dayAxisDiv.find('div.day-name p').text(day.name.daynamesmall);
  dayAxisDiv.find('div.day-nr p').text(day.name.daynr);
  dayAxisDiv.find('div.month-name p').text(day.name.monthnamesmall);

  this.scheduleContainer.find('.day-axis').append(dayAxisDiv);

  var daydiv = this.getTemplateClone('dayRowTemplate');
  $(daydiv).attr('id', day.date);

  for(var i = 0; i < 24; i += 1) {
    var hourpart = this.getTemplateClone('hourTimeFrameTemplate');
    hourpart.attr('id', 'hour_'+ i);
    hourpart.data('time', (i < 10 ? '0' + i : i) + ':00');
    $(daydiv).find('.day-row-time-parts').append(hourpart);
  }

  this.scheduleContainer.find('.schedule-body').append(daydiv);

  var timeAxis = this.scheduleContainer.find('.time-axis');
  timeAxis.parent().css({marginLeft: this.scheduleContainer.find('.day-axis').outerWidth() + 'px'});
}

IADAscheduleView.prototype.showCurrentDayTimeNeedle = function() {
  var currentDate = new Date();
  var firstDaySecond = this.dateToFirstMSec(currentDate);
  var date_row = $('.day-row#' + firstDaySecond);
  this.scheduleContainer.find('.day-axis-row.today:not(#label_' + firstDaySecond + ')').removeClass('today');
  this.scheduleContainer.find('.day-row.today:not(#' + firstDaySecond + ')').removeClass('today').removeClass('progress-bar');
  this.scheduleContainer.find('.day-row:not(#' + firstDaySecond + ') .time-needle').remove();
  if(date_row.length != 0) {
    this.scheduleContainer.find('.day-axis .day-axis-row#label_' + firstDaySecond).addClass('today');
    date_row.addClass('today').addClass('progress-bar');
    if($('.time-needle').length <= 0) {
      var needle = $('<div>', {class: 'time-needle', title: currentDate.toLocaleTimeString(), style: 'left: ' + this.dayTimeToPercentage(currentDate.customFormat('#hhh#:#mm#')) + '%;'});
      date_row.append(needle);
    } else {
      $('.time-needle').css({left: this.dayTimeToPercentage(currentDate.customFormat('#hhh#:#mm#')) + '%'});
    }
    var schedule = this;
    setTimeout(function() {schedule.showCurrentDayTimeNeedle();}, 30000);
  }
}

IADAscheduleView.prototype.formatDate = function(date) {
  return {
    full: date.customFormat("#DDDD# #DD# #MMMM# #YYYY#"),
    daynr: date.customFormat("#D#"),
    daynamesmall: date.customFormat("#DDD#"),
    monthnamesmall: date.customFormat("#MMM#"),
  }
}

IADAscheduleView.prototype.startAndEndOfWeek = function(date) {

  var date = date? new Date(date) : new Date();

  date.setHours(0,0,0,0);

  var day = date.getDay(), diff = date.getDate() - day + (day == 0 ? -7 : 0);
  var monday = new Date(date.setDate(diff + 1));

  var day = date.getDay(), diff = date.getDate() - day + (day == 0 ? -7 : 0);
  var sunday = new Date(date.setDate(diff + 7));

  return [monday.customFormat('#YYYY#-#MM#-#DD#'), sunday.customFormat('#YYYY#-#MM#-#DD#')];
}

IADAscheduleView.prototype.startAndEndOfMonth = function(date, monthdiff) {
  var now = date? new Date(date) : new Date();
  var monthdiff = monthdiff? monthdiff : 0;

  // Set time to some convenient value
  now.setHours(0,0,0,0);

  var y = now.getFullYear(), m = now.getMonth();
  var firstDay = new Date(y, m + monthdiff, 1);
  var lastDay = new Date(y, m + monthdiff + 1, 0);

  // Return array of date objects
  return [firstDay.customFormat('#YYYY#-#MM#-#DD#'), lastDay.customFormat('#YYYY#-#MM#-#DD#')];
}

IADAscheduleView.prototype.renderTodayAndTomorrow = function() {
  this.scheduleContainer = $('#' + this.options.container);
  this.bindEntityInfoControls();
  this.updateTodayTomorrowView();
  var schedule = this;
  setInterval(function() {schedule.updateTodayTomorrowView();}, 180000);
}

IADAscheduleView.prototype.bindEntityInfoControls = function() {
  this.scheduleContainer.find('p.entity-name').each(function(){
    var descriptionHeight;
    $(this).on('click', function() {
    if($(this).siblings('.entity-description').hasClass('opened')) {
      $(this).siblings('.entity-description').animate({height: 0}, {complete: function(){
      $(this).css({display: 'none', height: 'auto'}).removeClass('opened');
      }});
    } else {
      descriptionHeight = $(this).siblings('.entity-description').height();
      $(this).siblings('.entity-description').css({height: 0, display: 'block'}).animate({height: descriptionHeight}).addClass('opened');
    }
    });
  });
}

IADAscheduleView.prototype.updateTodayTomorrowView = function() {
  var schedule = this;
  $.ajax({
    type: 'GET',
    url: this.options.backend_url  + '/today_tomorrow_update',
    data: {

    }
  }).success(function(response) {
    schedule.afterTodayTomorrowUpdate(response);
  });
}

IADAscheduleView.prototype.afterTodayTomorrowUpdate = function(response) {
  if(response.length == 1) {
    this.afterTodayTomorrowUpdateEntity(response[0].entities, this.scheduleContainer);
  } else {
    for(var entity_type_array_nr in response) {
      var jentity_type = this.scheduleContainer.find('#entity_type_' + response[entity_type_array_nr].entity_type_id);
      this.afterTodayTomorrowUpdateEntity(response[entity_type_array_nr].entities, jentity_type);
    }
  }
}

IADAscheduleView.prototype.afterTodayTomorrowUpdateEntity = function(entity_type_info, parentdiv) {
  for(var entity_array_nr in entity_type_info) {
    var entity = entity_type_info[entity_array_nr];
    var jentity = parentdiv.find('#entity_' + entity.entity_id);
    jentity = jentity.find('div.updated-info').html('');
    this.createNewUpdatedInfo(entity, jentity);
  }
}


IADAscheduleView.prototype.createNewUpdatedInfo = function(entity, parentdiv) {
  if(entity.current_reservation == null && entity.upcoming_reservations.today.length  <= 0 && entity.upcoming_reservations.tomorrow.length <= 0) {
    parentdiv.append(this.getTemplateClone('noReservationsTemplate'));
    return;
  }


  if(entity.current_reservation != null) {
    reservation = entity.current_reservation;
    var currentInfo = this.getTemplateClone('currentReservationTemplate');

    currentInfo.find('.reservation-description').text(reservation.description);
    currentInfo.find('.begin-time').text(reservation.begin_time);
    currentInfo.find('.end-time').text(reservation.end_time);

    if(reservation.begin_date != reservation.end_date) {
      currentInfo.find('.begin-date').text(reservation.begin_date);
      currentInfo.find('.end-date').text(reservation.end_date);
      currentInfo.find('.date-info').show();

      for(var daysep_nr in reservation.day_separators) {
        currentInfo.find('.progress-bar').append($('<div>', {class: 'day-separator', style: 'left: '+ reservation.day_separators[daysep_nr] +'%'}));
      }
    }

    currentInfo.find('.progress-bar span').css('width', reservation.progress + '%');

    parentdiv.append(currentInfo);
    if(entity.upcoming_reservations.today.length  > 0 || entity.upcoming_reservations.tomorrow.length  > 0) {
      parentdiv.append($('<div>', {class: 'reservation-separator'}));
    }
  }

  if(entity.upcoming_reservations.today.length  > 0 || entity.upcoming_reservations.tomorrow.length  > 0) {
    var nextInfo = this.getTemplateClone('nextReservationsTemplate');

    for(up_nr in entity.upcoming_reservations.today) {
      var line = this.getTemplateClone('reservationLineTemplate');
      line.find('span.time').text(entity.upcoming_reservations.today[up_nr].begin_time + ' - ' + entity.upcoming_reservations.today[up_nr].end_time);
      line.find('span.description').text(entity.upcoming_reservations.today[up_nr].description);
      nextInfo.append(line);
    }

    if(entity.upcoming_reservations.tomorrow.length  > 0) {
      nextInfo.append(this.getTemplateClone('tomorrowLineTemplate'));
      for(up_nr in entity.upcoming_reservations.tomorrow) {
        var line = this.getTemplateClone('reservationLineTemplate');
        line.find('span.time').text(entity.upcoming_reservations.tomorrow[up_nr].begin_time + ' - ' + entity.upcoming_reservations.tomorrow[up_nr].end_time);
        line.find('span.description').text(entity.upcoming_reservations.tomorrow[up_nr].description);
        nextInfo.append(line);
      }
    }
    parentdiv.append(nextInfo);
  }
}