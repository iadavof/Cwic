APP.schedule_view = {
  horizontal_calendar: function() {
    new IADAscheduleView({
      container: 'horizontal-calendar',
      backend_url: Routes.organisation_schedule_view_index_path(current_organisation),
      view: 'horizontalCalendar'
    });

    $('#open-new-reservation-modal-button').on('click', function(e) {
        e.preventDefault();
        var reservationForm = openModal('new_reservation_popup', $('#reservation-form-modal-blueprint').data('blueprint'));
        APP.global.initializeDateTimePickers(reservationForm);
        return false;
    });
  },
  today_and_tomorrow: function() {
    new IADAscheduleView({
      container: 'today-and-tomorrow-container',
      backend_url: Routes.organisation_schedule_view_index_path(current_organisation),
      view: 'todayAndTomorrow'
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

function IADAscheduleView(options) {
  this.options = Object.extend({
    container: 'schedule-container',
    backend_url: 'url to backend',
    view: 'horizontalCalendar'
  }, options || {});

  this.scheduleContainer = null;
  this.scheduleItems = null;
  this.selectedEntities = [];
  this.beginDate = null;
  this.endDate = null;
  this.needleTimeout = null;
  this.currentMode = 'week';

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
  // Set schedule to current week
  var now = moment();
  this.beginDate = moment(now).startOf('week');
  this.endDate = moment(now).endOf('week');
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

  // Bind datepickers on domain selection fields and set current domain
  this.scheduleContainer.find('#scheduleBeginDate').datepicker({showOn: 'both'});
  this.scheduleContainer.find('#scheduleEndDate').datepicker({showOn: 'both'});

  this.updateDateDomainControl();

  // Bind set date button
  this.scheduleContainer.find('#scheduleDateUpdate').click(function(){schedule.setDateDomain();});

  var navigation = this.scheduleContainer.find('.control-container.navigate');
  navigation.find('.button').on('click', function () {
    var newBeginDate = null;
    var newEndDate = null;

    var reference = moment(schedule.beginDate);
    var now = moment();

    if(this.id == 'dayMode' || this.id == 'weekMode' || this.id == 'monthMode') {
      // Look if we are already in the selected mode and return
      if(schedule.currentMode == this.id + 'Mode') {
        return;
      }

      // Check if today is in the view, if so, use this as reference.
      if(moment(schedule.beginDate).startOf('day').unix() < now.unix() && now.unix() < moment(schedule.endDate).endOf('day').unix()) {
        reference = now;
      }

      var newMode = this.id.replace('Mode', '');

      newBeginDate = moment(reference).startOf(newMode);
      newEndDate = moment(reference).endOf(newMode);
      schedule.currentMode = newMode;
    }

    if(this.id == 'previous') {
      reference.subtract(schedule.currentMode + 's', 1);
      newBeginDate = moment(reference).startOf(schedule.currentMode);
      newEndDate = moment(reference).endOf(schedule.currentMode);
    }

    if(this.id == 'next') {
      reference.add(schedule.currentMode + 's', 1);
      newBeginDate = moment(reference).startOf(schedule.currentMode);
      newEndDate = moment(reference).endOf(schedule.currentMode);
    }

    if(this.id == 'current') {
      newBeginDate = moment(now).startOf(schedule.currentMode);
      newEndDate = moment(now).endOf(schedule.currentMode);
    }

    if(newBeginDate != null && newEndDate != null) {
      schedule.beginDate = newBeginDate;
      schedule.endDate = newEndDate;
      schedule.updateDateDomainControl();
      schedule.updateSchedule();
    }
  });

  this.bindNewReservationControls();
  this.bindDragControls();
  this.bindResizeControls();
}

IADAscheduleView.prototype.updateDateDomainControl = function() {
  this.scheduleContainer.find('#scheduleBeginDate').datepicker("setDate", this.beginDate.toDate());
  this.scheduleContainer.find('#scheduleEndDate').datepicker("setDate", this.endDate.toDate());
}

IADAscheduleView.prototype.nearestMomentPoint = function(relX, clickedElement) {
  var dayRowTP = $(clickedElement);

  var day = moment(dayRowTP.parents('.day-row').attr('id')).startOf('day');

  if(relX < 0) {
    // Begin of item is dragged to previous day
    day.subtract('days', 1);
    relX += dayRowTP.width();
  }

  var dayMousePos = relX.toFixed() / dayRowTP.width();
  var minutes = Math.round(dayMousePos * 1440);

  // Snap to half hours
  minutes = (Math.round(minutes/30) * 30);

  var hours = minutes / 60;
  minutes = minutes % 60;
  return day.hours(hours).minutes(minutes);
}

IADAscheduleView.prototype.bindResizeControls = function() {
  var currentScheduleItem = null;
  var dayRowTP = null;
  var side = null;
  var schedule = this;

  this.scheduleContainer.find('.schedule-body').on('mousedown', 'div.day-row-schedule-object-item-parts div.schedule-item div.resizer span.handle', function(event) {
    // left click, no drag already started and not on resize handles
    if(event.which == 1 && currentScheduleItem == null && dayRowTP == null && side == null) {
      var handle = $(this);
      side = (handle.parents('div.resizer').hasClass('left') ? 'left' : 'right');
      var scheduleItemClickedDom = handle.parents('div.schedule-item');

      // Lets get the scheduleItem!
      dayRowTP = scheduleItemClickedDom.parents('div.day-row-schedule-object-item-parts');
      currentScheduleItem = schedule.getScheduleItemForDOMObject(scheduleItemClickedDom, dayRowTP);
    }
  });

  this.scheduleContainer.on('mousemove', function(event) {
    if(currentScheduleItem != null && dayRowTP != null && side != null) {
      var offset = dayRowTP.offset();
      var relX = event.pageX - offset.left;
      // relX can be negative if item is dragged to previous day.

      var newMoment = schedule.nearestMomentPoint(relX, dayRowTP);

      currentScheduleItem.resizeConcept(side, newMoment);

      // Glow red if cannot be placed here
      if(currentScheduleItem.conceptCollidesWithOthers()) {
        currentScheduleItem.applyErrorGlow();
      }
    }
  });

  this.scheduleContainer.on('mouseup', function(event) {
    if(currentScheduleItem != null) {
      if(!currentScheduleItem.conceptCollidesWithOthers()) {
        currentScheduleItem.acceptConcept();
        schedule.patchScheduleItemBackend(currentScheduleItem);
      } else {
        currentScheduleItem.resetConcept();
      }
      currentScheduleItem = null;
      dayRowTP = null;
      side = null;
    }
  });
}

IADAscheduleView.prototype.getScheduleItemForDOMObject = function(SchObj, dayRowObj) {
  var schedule_object_id = dayRowObj.data('scheduleObjectID');
  var schId = SchObj.data('scheduleItemID');
  if(schedule_object_id != null && schId != null) {
    return schedule.scheduleItems[schedule_object_id][schId];
  }
  return null;
}

IADAscheduleView.prototype.bindDragControls = function() {
  var currentScheduleItem = null;
  var dayRowTP = null;
  var itemOffset = null;
  var schedule = this;

  this.scheduleContainer.find('.schedule-body').on('mousedown', 'div.day-row-schedule-object-item-parts div.schedule-item', function(event) {
    // left click, no drag already started and not on resize handles
    if(event.which == 1 && currentScheduleItem == null && dayRowTP == null && itemOffset == null && !$(event.target).hasClass('handle')) {
      var scheduleItemClickedDom = $(this);

      // Lets get the scheduleItem!
      dayRowTP = scheduleItemClickedDom.parents('div.day-row-schedule-object-item-parts');
      currentScheduleItem = schedule.getScheduleItemForDOMObject(scheduleItemClickedDom, dayRowTP);

      itemOffset = event.pageX - $(event.target).offset().left;
    }
  });

  this.scheduleContainer.on('mousemove', function(event) {
    if(currentScheduleItem != null && dayRowTP != null && itemOffset != null) {
      var offset = dayRowTP.offset();

      // correct position in schedule-item, because we want to know the begin position of this item.
      var relX = event.pageX - offset.left - itemOffset;
      // relX can be negative if item is dragged to previous day.

      var newMoment = schedule.nearestMomentPoint(relX, dayRowTP);
      currentScheduleItem.moveConceptTo(newMoment);

      // Glow red if cannot be placed here
      if(currentScheduleItem.conceptCollidesWithOthers()) {
        currentScheduleItem.applyErrorGlow();
      }
    }
  });

  this.scheduleContainer.on('mouseup', function() {
    if(currentScheduleItem != null) {
      if(!currentScheduleItem.conceptCollidesWithOthers()) {
        currentScheduleItem.acceptConcept();
        schedule.patchScheduleItemBackend(currentScheduleItem);
      } else {
        currentScheduleItem.resetConcept();
      }
      currentScheduleItem = null;
      dayRowTP = null;
      itemOffset = null;
    }
  });
}

IADAscheduleView.prototype.patchScheduleItemBackend = function() {
  // To be implemented
}

IADAscheduleView.prototype.bindNewReservationControls = function() {
  var newScheduleItem = null;
  var schedule = this;
  this.scheduleContainer.find('.schedule-body').on('mousedown', 'div.day-row-schedule-object-item-parts', function(event) {
    // check if left mouse button, starting a new item and check if not clicked on other reservation
    if(event.which == 1 && newScheduleItem == null && $(event.target).hasClass('day-row-schedule-object-item-parts')) {
      var offset = $(this).offset();
      var relX = event.pageX - offset.left;
      var schedule_object_id = $(event.target).data('scheduleObjectID');
      newScheduleItem = new IADAscheduleViewItem(schedule, schedule_object_id);
      var nearestMoment = schedule.nearestMomentPoint(relX, this);
      newScheduleItem.conceptBegin = moment(nearestMoment);
      newScheduleItem.conceptEnd = moment(nearestMoment);
      newScheduleItem.render(true); // Render in concept mode
    }
  });

  this.scheduleContainer.find('.schedule-body').on('mousemove', 'div.day-row-schedule-object-item-parts', function(event) {
    var offset = $(this).offset();
    var relX = event.pageX - offset.left;
    if(newScheduleItem != null) {
      newScheduleItem.conceptEnd = schedule.nearestMomentPoint(relX, this);
      if(newScheduleItem.checkEndAfterBegin(true) && !newScheduleItem.conceptCollidesWithOthers()) {
        newScheduleItem.rerender(true); // rerender in concept mode
      }
    }
  });

  this.scheduleContainer.find('.schedule-body').on('mouseup', function(event) {
    // Handle new entry
    if(newScheduleItem != null && newScheduleItem.checkEndAfterBegin(true) && !newScheduleItem.conceptCollidesWithOthers()) {
      var reservationForm = openModal('new_reservation_popup', $('#reservation-form-modal-blueprint').data('blueprint') ,function(e) {
        e.preventDefault();
        if(newScheduleItem != null) {
          newScheduleItem.removeFromDom();
          newScheduleItem = null;
        }
        closeModal(e);
      })
      APP.global.initializeDateTimePickers(reservationForm);
      schedule.setNewReservationForm(newScheduleItem);
    } else {
      if(newScheduleItem != null) {
        newScheduleItem.removeFromDom();
        newScheduleItem = null;
      }
    }
  });
}

IADAscheduleView.prototype.setNewReservationForm = function(newScheduleItem) {
  var reservationForm = $('#new_reservation_popup');

  var beginJDate = newScheduleItem.getConceptBegin().toDate();
  var endJDate = newScheduleItem.getConceptEnd().toDate();

  reservationForm.find('input#begins_at_date').datepicker("setDate", beginJDate);
  reservationForm.find('input#begins_at_tod').timepicker("setTime", beginJDate);
  reservationForm.find('input#ends_at_date').datepicker("setDate", endJDate);
  reservationForm.find('input#ends_at_tod').timepicker("setTime", endJDate);

  reservationForm.find('select#reservation_entity_id').val(newScheduleItem.schedule_object_id);
}

IADAscheduleView.prototype.setDateDomain = function() {
  var beginDateField = this.scheduleContainer.find('#scheduleBeginDate');
  var endDateField = this.scheduleContainer.find('#scheduleEndDate');

  var newBeginMoment = moment(beginDateField.datepicker('getDate'));
  var newEndMoment = moment(endDateField.datepicker('getDate'));

  // Check if entered endDate is bigger than the entered beginDate
  if(moment(newEndMoment).startOf('day').unix() < moment(newBeginMoment).startOf('day').unix()) {
    this.setErrorField(endDateField, true);
    return;
  } else {
    this.setErrorField(endDateField, false);
  }

  this.beginDate = newBeginMoment;
  this.endDate = newEndMoment;
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
  var days = this.getDatesBetween(this.beginDate, this.endDate);
  for(var daynr in days) {
    this.appendDay(days[daynr]);
    if(moment(days[daynr]).startOf('day').unix() == moment().startOf('day').unix()) {
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
        schedule_begin: this.beginDate.format('YYYY-MM-DD'),
        schedule_end: this.endDate.format('YYYY-MM-DD'),
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
  this.updateDateDomainControl();
}

IADAscheduleView.prototype.disabledOverlay = function() {
  this.scheduleContainer.find('.schedule-body').append($('<div></div>', {class: 'disabled-overlay', text: 'Geen objecten geselecteerd.'})); //I18n T TODO
}

IADAscheduleView.prototype.afterScheduleObjectsLoad = function(response) {
  this.beginDate = moment(response.begin_date);
  this.endDate = moment(response.end_date);

  this.updateDateDomainControl();

  this.createSchedule();
  this.initDayRowScheduleObjectRows(response.schedule_objects);
  this.addAllScheduleItems(response.schedule_objects);
}

IADAscheduleView.prototype.initDayRowScheduleObjectRows = function(schobjJSON) {
  var schedule = this;
  // Add schedule object container divs to the DOM
  $.each(schobjJSON, function(sobjId, sobj) {
    var newSchObjItemParts = schedule.getTemplateClone('dayRowScheduleObjectItemPartsTemplate');
    newSchObjItemParts.addClass('scheduleObject_' + sobjId);
    newSchObjItemParts.data('scheduleObjectID', sobjId);
    newSchObjItemParts.find('p.name').text(sobj.schedule_object_name);
    $(schedule.scheduleContainer).find('div.day-row div.day-row-schedule-objects').append(newSchObjItemParts);
  });

  // Adjust height of object rows based on the number of objects that are being selected.
  var schobjSize = $.size(schobjJSON);
  if(schobjSize != null) {
    if(schobjSize == 1) {
      $('.day-row-schedule-object-item-parts').css('height', '60px');
    } else if(schobjSize == 2) {
      $('.day-row-schedule-object-item-parts').css('height', '30px');
    } else {
      $('.day-row-schedule-object-item-parts').css('height', '20px');
      $('.day-axis .day-axis-row:not(.today)').height($('.day-row:not(.today)').outerHeight());
      $('.day-axis .day-axis-row.today').height($('.day-row.today').outerHeight());
    }
  }
}

IADAscheduleView.prototype.addAllScheduleItems = function(schobjJSON) {
  var schedule = this;
  this.scheduleItems = {};
  $.each(schobjJSON, function(schedule_object_id, sobj) {
    schedule.scheduleItems[schedule_object_id] = {};
    $.each(sobj.items, function(itemId, item) {
      var schvi = new IADAscheduleViewItem(schedule, schedule_object_id, itemId);
      schvi.parseFromJSON(item);
      schedule.scheduleItems[schedule_object_id][itemId] = schvi;
      schvi.render();
    });
  });
}

IADAscheduleView.prototype.dayTimePercentageSpan = function(beginMoment, endMoment) {
  if(typeof beginMoment === 'string') {
    beginMoment = moment(beginMoment, 'HH:mm');
  }
  if(typeof endMoment === 'string') {
    endMoment = moment(endMoment, 'HH:mm');
  }
  return moment(endMoment).diff(beginMoment, 'minutes') / 14.4;
}

IADAscheduleView.prototype.dayTimeToPercentage = function(currentMoment) {
  if(typeof currentMoment === 'string') {
    currentMoment = moment(currentMoment, 'HH:mm');
  }
  return moment(currentMoment).diff(currentMoment.startOf('day'), 'minutes') / 14.4;
}

IADAscheduleView.prototype.getTemplateClone = function(id) {
  var newitem = $('#schedule-templates').find('#' + id).clone();
  newitem.removeAttr('id');
  newitem.show();
  return newitem;
}

IADAscheduleView.prototype.getDatesBetween = function(begin, end) {
  var currentMoment = moment(begin).startOf('day');
  var nrdays = moment(end).endOf('day').diff(moment(begin).startOf('day'), 'days');
  var days = [];
  // Also include last day, so <=
  for(var daynr = 0; daynr <= nrdays; daynr++) {
    days.push(currentMoment);
    currentMoment = moment(currentMoment).add('days', 1);
  }
  return days;
}

IADAscheduleView.prototype.appendDay = function(dayMoment) {
  var dayAxisDiv = this.getTemplateClone('dayAxisRowTemplate');
  dayAxisDiv.attr('id', 'label_' + dayMoment.format('YYYY-MM-DD'));
  dayAxisDiv.find('div.day-name p').text(dayMoment.format('dd'));
  dayAxisDiv.find('div.day-nr p').text(dayMoment.format('D'));
  dayAxisDiv.find('div.month-name p').text(dayMoment.format('MMM'));

  this.scheduleContainer.find('.day-axis').append(dayAxisDiv);

  var daydiv = this.getTemplateClone('dayRowTemplate');
  $(daydiv).attr('id', dayMoment.format('YYYY-MM-DD'));

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
  var currentDate = moment().format('YYYY-MM-DD');
  var date_row = this.scheduleContainer.find('.day-row#' + currentDate);
  this.scheduleContainer.find('.day-axis-row.today:not(#label_' + currentDate + ')').removeClass('today');
  this.scheduleContainer.find('.day-row.today:not(#' + currentDate + ')').removeClass('today').removeClass('progress-bar');
  this.scheduleContainer.find('.day-row:not(#' + currentDate + ') .time-needle').remove();
  if(date_row.length != 0) {
    this.scheduleContainer.find('.day-axis .day-axis-row#label_' + currentDate).addClass('today');
    date_row.addClass('today').addClass('progress-bar');
    if($('.time-needle').length <= 0) {
      var needle = $('<div>', {class: 'time-needle', title: moment().toDate().toLocaleString(), style: 'left: ' + this.dayTimeToPercentage(moment()) + '%;'});
      date_row.append(needle);
    } else {
      $('.time-needle').css({left: this.dayTimeToPercentage(moment()) + '%'});
    }
    var schedule = this;
    setTimeout(function() {schedule.showCurrentDayTimeNeedle();}, 30000);
  }
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
        descriptionHeight = $(this).siblings('.entity-description').outerHeight();
        $(this).siblings('.entity-description').css({height: 0, display: 'block'}).animate({height: descriptionHeight}, {complete: function() {
          $(this).css({height: 'auto'});
        }}).addClass('opened');
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
    var reservation = entity.current_reservation;
    var begin_moment = moment(reservation.begin_moment);
    var end_moment = moment(reservation.end_moment);

    var currentInfo = this.getTemplateClone('currentReservationTemplate');

    currentInfo.find('.reservation-description').text(reservation.description);
    currentInfo.find('.begin-time').text(begin_moment.format('HH:mm'));
    currentInfo.find('.end-time').text(end_moment.format('HH:mm'));

    // Check if event is multiple day event
    if(moment(begin_moment).startOf('day').unix() != moment(end_moment).startOf('day').unix()) {
      currentInfo.find('.begin-date').text(begin_moment.format('l'));
      currentInfo.find('.end-date').text(end_moment.format('l'));
      currentInfo.find('.date-info').show();

      // Day separators in progress bar, only if it does not fill the whole bar
      var progressBar = currentInfo.find('.progress-bar');
      if(reservation.day_separators != null && reservation.day_separators.length < parseInt(progressBar.width()) / 4) {
        for(var daysep_nr in reservation.day_separators) {
          progressBar.append($('<div>', {class: 'day-separator', style: 'left: '+ reservation.day_separators[daysep_nr] +'%'}));
        }
      }
    }

    // Set progressbar
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
      line.find('span.time').text(moment(entity.upcoming_reservations.today[up_nr].begin_moment).format('HH:mm') + ' - ' + moment(entity.upcoming_reservations.today[up_nr].end_moment)).format('HH:mm');
      line.find('span.description').text(entity.upcoming_reservations.today[up_nr].description);
      nextInfo.append(line);
    }

    if(entity.upcoming_reservations.tomorrow.length  > 0) {
      nextInfo.append(this.getTemplateClone('tomorrowLineTemplate'));
      for(up_nr in entity.upcoming_reservations.tomorrow) {
        var line = this.getTemplateClone('reservationLineTemplate');
        line.find('span.time').text(moment(entity.upcoming_reservations.tomorrow[up_nr].begin_moment).format('HH:mm') + ' - ' + moment(entity.upcoming_reservations.tomorrow[up_nr].end_moment)).format('HH:mm');
        line.find('span.description').text(entity.upcoming_reservations.tomorrow[up_nr].description);
        nextInfo.append(line);
      }
    }
    parentdiv.append(nextInfo);
  }
}

/////////////////// Schedule Item ///////////////////

function IADAscheduleViewItem(_schedule, _schedule_object_id, _item_id) {
  this.schedule = _schedule;
  this.scheduleContainer = _schedule.scheduleContainer;
  this.schedule_object_id = _schedule_object_id || null;
  this.item_id = _item_id || null;

  this.begin = null; // momentjs object
  this.end = null; // momentjs object

  this.conceptBegin = null; // momentjs object
  this.conceptEnd = null; // momentjs object
  this.conceptMode = false; // momentjs object


  this.bg_color = '#666';
  this.text_color = '#fff';
  this.description = '';
  this.show_url = null;

  this.domObjects = [];


}

IADAscheduleViewItem.prototype.parseFromJSON = function(newItem) {
  this.begin = moment(newItem.begin_moment);
  this.end = moment(newItem.end_moment);
  this.bg_color = newItem.bg_color;
  this.text_color = newItem.text_color;
  this.description = newItem.description;
  this.show_url = newItem.show_url;
}

IADAscheduleViewItem.prototype.applyErrorGlow = function() {
  $.each(this.domObjects, function(index, item) {
    item.addClass('error-glow');
  });
}

IADAscheduleViewItem.prototype.renderPart = function(jschobj, beginTime, endTime) {
  var newScheduleItem = this.schedule.getTemplateClone('scheduleItemTemplate');
  newScheduleItem.css('left', + this.schedule.dayTimeToPercentage(beginTime) + '%');
  newScheduleItem.css('width', + this.schedule.dayTimePercentageSpan(beginTime, endTime) + '%');
  newScheduleItem.css('background-color', this.bg_color);
  newScheduleItem.css('color', this.text_color);

  // Add scheduleItem ID to DOM object
  newScheduleItem.data('scheduleItemID', this.item_id);

  var newScheduleItemText = newScheduleItem.find('a.item-text');
  if(this.show_url) {
    newScheduleItemText.attr('href', this.show_url);
  }
  newScheduleItemText.text(this.description);
  newScheduleItemText.attr('title', this.description);
  newScheduleItemText.css('color', this.text_color);
  jschobj.append(newScheduleItem);
  return newScheduleItem;
}

IADAscheduleViewItem.prototype.acceptConcept = function() {
  this.begin = this.getConceptBegin();
  this.end = this.getConceptEnd();

  this.rerender();
}

IADAscheduleViewItem.prototype.resetConcept = function() {
  this.conceptBegin = null;
  this.conceptEnd = null;
  this.rerender(); // Rerender in normal mode
}

IADAscheduleViewItem.prototype.moveConceptTo = function(newBeginMoment) {
  if(newBeginMoment.unix() == this.getConceptBegin().unix()) {
    // Nothing changed, move on
    return;
  }

  // Keep the duration of the item
  var duration = this.getConceptEnd().diff(this.getConceptBegin());

  this.conceptBegin = moment(newBeginMoment);
  this.conceptEnd = moment(newBeginMoment).add('ms', duration);

  this.rerender(true); // Rerender as concept
}

IADAscheduleViewItem.prototype.resizeConcept = function(side, newMoment) {
  if(side == 'left') {
    if(newMoment.unix() == this.getConceptBegin().unix()) {
      // Nothing changed, move on
      return;
    }
    this.conceptBegin = moment(newMoment);
  } else {
    if(newMoment.unix() == this.getConceptEnd().unix()) {
      // Nothing changed, move on
      return;
    }
    this.conceptEnd = moment(newMoment);
  }
  this.rerender(true);
}

IADAscheduleViewItem.prototype.checkEndAfterBegin = function(concept) {
  if(concept) {
    var currBegin = this.getConceptBegin();
    var currEnd = this.getConceptEnd();
    return currBegin.unix() < currEnd.unix();
  } else {
    var currBegin = this.begin;
    var currEnd = this.end;
  }
  if(currBegin == null || currEnd == null) {
    return false;
  }
  return this.begin.unix() < this.end.unix();
}

IADAscheduleViewItem.prototype.getConceptBegin = function() {
  return moment((this.conceptBegin != null) ? this.conceptBegin : this.begin);
}

IADAscheduleViewItem.prototype.getConceptEnd = function() {
  return moment((this.conceptEnd != null) ? this.conceptEnd : this.end);
}

// This function has to be extended to check collision with first events just out of the current calendar scope
IADAscheduleViewItem.prototype.conceptCollidesWithOthers = function() {
  var _this = this;
  var curConceptBegin = this.getConceptBegin();
  var curConceptEnd = this.getConceptEnd();

  var otherItemsForObject = this.schedule.scheduleItems[this.schedule_object_id];

  var collision = false;

  if(otherItemsForObject != null) {
    $.each(otherItemsForObject, function(itemId, item) {
      // exclude self
      if(_this.item_id != null && itemId == _this.item_id) {
        return true;
      }
      if((item.begin.unix() < curConceptEnd.unix() || item.end.unix() < curConceptBegin.unix()) && curConceptBegin.unix() < item.end.unix()) {
        collision = true;
        return false; // Break out of each loop
      }
    });
  }

  return collision;
}

IADAscheduleViewItem.prototype.conceptCollidesWith = function(moment) {
  var curConceptBegin = this.getConceptBegin();
  var curConceptEnd = this.getConceptEnd();

  return (curConceptBegin.unix() <= moment.unix() && curConceptEnd.unix() > moment.unix());
}

IADAscheduleViewItem.prototype.removeFromDom = function() {
  for(var nr in this.domObjects) {
    $(this.domObjects[nr]).remove();
  }
  this.domObjects = [];
}

IADAscheduleViewItem.prototype.rerender = function(concept) {
  this.removeFromDom();
  this.render(concept);
}

IADAscheduleViewItem.prototype.render = function(concept) {
  this.conceptMode = concept || false;
  if(this.conceptMode) {
    var currBegin = this.getConceptBegin();
    var currEnd = this.getConceptEnd();
  } else {
    var currBegin = this.begin;
    var currEnd = this.end;
  }

  if(!this.checkEndAfterBegin(concept)) {
    return;
  }

  if(moment(currBegin).startOf('day').unix() == moment(currEnd).startOf('day').unix()) {
    var beginDate = currBegin.format('YYYY-MM-DD');
    var container = $(this.scheduleContainer).find('#' + beginDate + ' div.day-row-schedule-objects div.scheduleObject_' + this.schedule_object_id);
    var schedulePart = this.renderPart(container, currBegin.format('HH:mm'), currEnd.format('HH:mm'));
    if(this.item_id != null) { // Do not show resizers when drawing new item
      schedulePart.find('div.resizer.left').show();
      schedulePart.find('div.resizer.right').show();
    }
    this.domObjects.push(schedulePart);
  } else {
    var days = this.schedule.getDatesBetween(currBegin, currEnd);
    for(var dayi in days) {
      var container = this.scheduleContainer.find('#' + days[dayi].format('YYYY-MM-DD') + ' div.day-row-schedule-objects div.scheduleObject_' + this.schedule_object_id);
      // Check if the container is not present, this means not in current view, so skip
      if(container.length == 0) {
        continue;
      }
      switch(parseInt(dayi)) {
        case 0:
          var schedulePart = this.renderPart(container, currBegin.format('HH:mm'), '24:00');
          schedulePart.find('div.continue.right').show();
          if(this.item_id != null) { // Do not show resizers when drawing new item
            schedulePart.find('div.resizer.left').show();
          }
          break;
        case days.length - 1:
          var schedulePart = this.renderPart(container, '00:00', currEnd.format('HH:mm'));
          schedulePart.find('div.continue.left').show();
          if(this.item_id != null) { // Do not show resizers when drawing new item
            schedulePart.find('div.resizer.right').show();
          }
          break;
        default:
          var schedulePart = this.renderPart(container, '00:00', '24:00');
          schedulePart.find('div.continue').show();
          break;
      }
      this.domObjects.push(schedulePart);
    }
  }
}