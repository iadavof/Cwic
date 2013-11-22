APP.schedule_view = {
  horizontal_calendar_day: function() {
    new IADAscheduleView({
      container: 'horizontal-calendar',
      backend_url: Routes.organisation_schedule_view_index_path(current_organisation),
      patch_reservation_url: Routes.organisation_reservations_path(current_organisation),
      organisation_client_url: Routes.organisation_organisation_clients_path(current_organisation),
      view: 'horizontalCalendar',
      zoom: 'day',
    });

    $('#open-new-reservation-modal-button').on('click', function(e) {
        e.preventDefault();
        var reservationForm = openModal('new_reservation_popup', $('#reservation-form-modal-blueprint').data('blueprint'));
        APP.global.initializeDateTimePickers(reservationForm);
        return false;
    });
  },
  horizontal_calendar_week: function() {
    new IADAscheduleView({
      container: 'horizontal-calendar',
      backend_url: Routes.organisation_schedule_view_index_path(current_organisation),
      patch_reservation_url: Routes.organisation_reservations_path(current_organisation),
      organisation_client_url: Routes.organisation_organisation_clients_path(current_organisation),
      view: 'horizontalCalendar',
      zoom: 'week',
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
    patch_reservation_url: 'url to reservations controller',
    view: 'horizontalCalendar',
    snap_part: '0.5',
    zoom: 'day',
    min_description_width: 75,
  }, options || {});

  this.scheduleContainer = null;
  this.scheduleItems = null;
  this.selectedEntities = [];
  this.beginDate = null;
  this.endDate = null;
  this.navigationReference;
  this.customDomainLength = null;
  this.needleTimeout = null;
  this.focusedScheduleItem = null;
  this.statusMessageTimeout = null;
  this.currentMode = (this.options.zoom == 'day') ? 'week' : 'month';

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
  this.scheduleContainer = $('#' + this.options.container);
  this.scheduleContainer.append(this.getTemplateClone('scheduleContainerTemplate').contents());
  this.scheduleContainer.addClass('horizontal-calendar');

  // Set schedule to the selected date or current date
  this.navigationReference = this.getFocusMoment();
  this.setBeginAndEndFromNavigationReference();
}

IADAscheduleView.prototype.getFocusMoment = function() {
    if(this.scheduleContainer.data('target-year') != '' && this.scheduleContainer.data('target-month') != '' && this.scheduleContainer.data('target-day') != '') {
    var now = moment(this.scheduleContainer.data('target-year') + '-' + this.scheduleContainer.data('target-month') + '-' + this.scheduleContainer.data('target-day'));
  } else if(this.scheduleContainer.data('target-year') != '' && this.scheduleContainer.data('target-week') != '') {
    var now = moment(this.scheduleContainer.data('target-year') + '-' + this.scheduleContainer.data('target-week'), 'GGGG-WW');
  } else {
    var now = moment();
  }
  return now;
}

IADAscheduleView.prototype.setBeginAndEndFromNavigationReference = function() {
  if(this.currentMode == 'custom' && this.customDomainLength != null) {
    this.beginDate = moment(this.navigationReference).startOf(this.options.zoom);
    this.endDate = moment(this.navigationReference).add('days', this.customDomainLength).endOf(this.options.zoom);
  } else {
    this.beginDate = moment(this.navigationReference).startOf(this.currentMode).startOf(this.options.zoom);
    this.endDate = moment(this.navigationReference).endOf(this.currentMode).endOf(this.options.zoom);
  }
}

IADAscheduleView.prototype.toggleEntity = function(entity_button) {
  var entity_button = $(entity_button);
  var id = parseInt(entity_button.attr('id').split('_')[1]);

  if(entity_button.hasClass('active')) {
    entity_button.removeClass('active').css({'border-color': '', 'border-bottom-color': entity_button.data('entity-color')});
    this.selectedEntities.splice($.inArray(id, this.selectedEntities), 1);
  } else {
    entity_button.addClass('active').css('border-color', entity_button.data('entity-color'));
    this.selectedEntities.push(id);
  }

  if(typeof(Storage) !== 'undefined') {
    localStorage.previouslySelectedEntities = this.selectedEntities;
  }

  this.updateSchedule();
}

IADAscheduleView.prototype.toggleCustomDomainControls = function() {
  var customDomainButton = this.scheduleContainer.find('div.control-container.navigate a#customMode');
  var controlContainer = this.scheduleContainer.find('div.control-container.domain');
  if(customDomainButton.hasClass('active')) {
    controlContainer.animate({height: controlContainer.find('div.inner').outerHeight() + 'px'}, 300, 'swing', function(){
      $(this).css('height', 'auto');
    });
  } else {
    controlContainer.animate({height: 0}, 300, 'swing');
  }


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

  // Set the correct scope button to active
  this.scheduleContainer.find('div.control-container.navigate a.button#' + this.currentMode + 'Mode').addClass('active');

  this.scheduleContainer.find('.schedule-body').on('click', function() {
    schedule.closeToolbar();
  });

  // Bind datepickers on domain selection fields and set current domain
  this.scheduleContainer.find('#scheduleBeginDate').datepicker({showOn: 'both'});
  this.scheduleContainer.find('#scheduleEndDate').datepicker({showOn: 'both'});

  this.updateDateDomainControl();

  // Bind set date button
  this.scheduleContainer.find('#scheduleDateUpdate').click(function(){schedule.setDateDomain();});

  var navigation = this.scheduleContainer.find('.control-container.navigate');
  if(this.options.zoom == 'day') {
    navigation.find('.button#yearMode').remove();
  } else {
    navigation.find('.button#dayMode').remove();
  }

  navigation.find('.button').on('click', function () {
    button = $(this);

    if(button.hasClass('scope')) {
      button.siblings('.scope').removeClass('active');
    }

    if(this.id == 'dayMode' || this.id == 'weekMode' || this.id == 'monthMode' || this.id == 'yearMode' || this.id == 'customMode') {
      button.addClass('active');
      // Look if we are already in the selected mode and return
      if(schedule.currentMode == this.id + 'Mode') {
        return;
      }

      if(this.id != 'customMode') {
        // Remove the custom domain length, because the custom scope is deselected
        schedule.customDomainLength = null;
      }
      schedule.toggleCustomDomainControls();

      var newMode = this.id.replace('Mode', '');
      schedule.currentMode = newMode;
    }

    if(this.id == 'previous') {
      if(schedule.currentMode == 'custom') {
        if(schedule.customDomainLength == null) {
          schedule.customDomainLength = moment(schedule.endDate).diff(schedule.beginDate, 'days');
        }
        schedule.navigationReference.subtract('days', schedule.customDomainLength);
      } else {
        schedule.navigationReference.subtract(schedule.currentMode + 's', 1);
      }
    }

    if(this.id == 'next') {
      if(schedule.currentMode == 'custom') {
        if(schedule.customDomainLength == null) {
          schedule.customDomainLength = moment(schedule.endDate).diff(schedule.beginDate, 'days');
        }
        schedule.navigationReference.add('days', schedule.customDomainLength);
      } else {
        schedule.navigationReference.add(schedule.currentMode + 's', 1);
      }
    }

    if(this.id == 'current') {
      schedule.navigationReference = moment();
    }

    // Nog geen update bij het openen van de custom domain controls
    if(this.id != 'customMode') {
      schedule.setBeginAndEndFromNavigationReference();
      schedule.updateDateDomainControl();
      schedule.updateSchedule();
    }

  });

  this.bindNewReservationControls();
  this.bindDragAndResizeControls();
  this.bindToolbarEvents();
  this.bindOnResize();
}

IADAscheduleView.prototype.bindToolbarEvents = function() {
  var schedule = this;
  schedule.scheduleContainer.find('.schedule-body, .left-axis').each(function() {
    $(this).attr('data-original-padding-top', $(this).css('padding-top'));
  });
  schedule.scheduleContainer.find('.toolbar-close-button').on('click', function() {
    schedule.closeToolbar();
    return false;
  });

  this.scheduleContainer.find('.schedule-body').on('click', 'div.schedule-item a.open-toolbar', function(event) {
    event.preventDefault();
    var scheduleItemDOM = $(this).parents('.schedule-item');
    var dayRowTP = scheduleItemDOM.parents('.row-schedule-object-item-parts');
    var scheduleItem = schedule.getScheduleItemForDOMObject(scheduleItemDOM, dayRowTP);

    if(schedule.focusedScheduleItem == null) {
      schedule.openToolbar(scheduleItem);
    } else if (schedule.focusedScheduleItem.item_id != scheduleItem.item_id) {
      schedule.closeToolbar(function(){schedule.openToolbar(scheduleItem);});
    } else {
      schedule.closeToolbar();
    }

    return false;
  });

  this.bindToolbarButtonActions();
}

IADAscheduleView.prototype.closeToolbar = function(callback) {
    this.removeFocusFromAllScheduleItems();
    this.updateScheduleItemFocus();
    schedule.scheduleContainer.find('.schedule-body, .left-axis').each(function() {
      $(this).animate({'padding-top': $(this).data('original-padding-top')}, 200);
    });
    this.scheduleContainer.find('div.time-axis div.reservation-controls').removeClass('open').animate({height: 0}, 200, callback);
}

IADAscheduleView.prototype.openToolbar = function(scheduleItem) {
  var schedule = this;

  var timeAxis = schedule.scheduleContainer.find('.time-axis');
  var toolbar = timeAxis.find('div.reservation-controls');
  var toolbarHeight = toolbar.find('.inner').outerHeight();

  scheduleItem.applyFocus();

  schedule.scheduleContainer.find('.schedule-body, .left-axis').each(function() {
    $(this).animate({'padding-top': parseInt($(this).data('original-padding-top')) + toolbarHeight + 'px'}, 200);

  });
  toolbar.addClass('open').animate({height: toolbarHeight + 'px'}, 200, function() {
    $(this).css({height: 'auto'});
  });
}

IADAscheduleView.prototype.bindOnResize = function() {
  var schedule = this;
  var toolbar = schedule.scheduleContainer.find('.time-axis div.reservation-controls');
  $(window).on('resize', function() {
    schedule.scheduleContainer.find('.schedule-body, .left-axis').each(function() {
      $(this).css({'padding-top': parseInt($(this).data('original-padding-top')) + toolbar.outerHeight() + 'px'});
    });
  });
}

IADAscheduleView.prototype.updateDateDomainControl = function() {
  this.scheduleContainer.find('#scheduleBeginDate').datepicker("setDate", this.beginDate.toDate());
  this.scheduleContainer.find('#scheduleEndDate').datepicker("setDate", this.endDate.toDate());
}

IADAscheduleView.prototype.nearestMomentPoint = function(relX, clickedElement) {
  var rowTP = $(clickedElement);

  if(this.options.zoom == 'day') {
    var beginPoint = moment(rowTP.parents('.row').attr('id')).startOf('day');
  } else {
    var beginPoint = moment(rowTP.parents('.row').attr('id'), 'GGGG-WW').startOf('week');
  }

  if(relX < 0) {
    // Begin of item is dragged to previous day
    beginPoint.subtract(this.options.zoom + 's', 1);
    relX += rowTP.width();
  }

  var dayMousePos = relX.toFixed() / rowTP.width();
  if(this.options.zoom == 'day') {
    var minutes = Math.round(dayMousePos * 1440);
  } else {
    var minutes = Math.round(dayMousePos * 10080);
  }

  var snapLength = (this.options.zoom == 'day') ? 60 : 360;

  // Snap to snap interval
  minutes = (Math.round(minutes / (this.options.snap_part * snapLength)) * this.options.snap_part * snapLength);

  return beginPoint.add(minutes, 'minutes');
}

IADAscheduleView.prototype.getScheduleItemForDOMObject = function(SchObj, dayRowObj) {
  var schedule_object_id = dayRowObj.data('scheduleObjectID');
  var schId = SchObj.data('scheduleItemID');
  if(schedule_object_id != null && schId != null) {
    return schedule.scheduleItems[schedule_object_id][schId];
  }
  return null;
}

IADAscheduleView.prototype.bindDragAndResizeControls = function() {
  var schedule = this;
  var currentScheduleItem = null;
  var side = null;
  var rowTP = null;
  var dragStartMoment = null;
  var schedule = this;
  var lastDragMoment = null;

  this.scheduleContainer.find('.schedule-body').on('mousedown', 'div.row-schedule-object-item-parts div.schedule-item', function(event) {
    // left click, no drag already started and not on resize handles
    if(event.which == 1 && currentScheduleItem == null && $(event.target).closest('a.open-toolbar').length == 0) {

      var scheduleItemClickedDom = $(this);

      // Only continue if there is no foccussed item or the focussed item is this item
      if(schedule.focusedScheduleItem == null || schedule.focusedScheduleItem.item_id == scheduleItemClickedDom.data('scheduleItemID')) {

        rowTP = scheduleItemClickedDom.parents('div.row-schedule-object-item-parts');
        var offset = rowTP.offset();

        // Check if drag started on resize handle
        var handle = $(event.target).closest('div.resizer');
        if(handle.length != 0) { // resize mode
          side = (handle.hasClass('left') ? 'left' : 'right');
        } else { // drag mode

          var relX = event.pageX - offset.left;
          dragStartMoment = schedule.nearestMomentPoint(relX, rowTP);
          lastDragMoment = dragStartMoment;
        }

        // Lets get the scheduleItem!
        currentScheduleItem = schedule.getScheduleItemForDOMObject(scheduleItemClickedDom, rowTP);
      }
    }
  });

  this.scheduleContainer.on('mousemove', function(event) {
    if(currentScheduleItem != null) {
      var scheduleItemClickedDom = $(event.target);
      if(scheduleItemClickedDom.hasClass('row-schedule-object-item-parts')) {
        var newRow = scheduleItemClickedDom;
      } else {
        var newRow = scheduleItemClickedDom.parents('div.row-schedule-object-item-parts');
      }

      if(newRow.length > 0) {
        rowTP = newRow;
      }
      var offset = rowTP.offset();
      var relX = event.pageX - offset.left
      var newMoment = schedule.nearestMomentPoint(relX, rowTP);
      if(side == null) { // drag item mode
        // correct position in schedule-item, because we want to know the begin position of this item.
        // relX can be negative if item is dragged to previous day.
        if(newMoment.unix() != lastDragMoment.unix()) {
          var dragMomentDiffMS = moment(newMoment).diff(dragStartMoment);
          currentScheduleItem.applyTimeDiffConcept(dragMomentDiffMS);
          lastDragMoment = newMoment;
        }
      } else { // resize mode
        // relX can be negative if item is dragged to previous day.
        currentScheduleItem.resizeConcept(side, newMoment);
      }

      // Glow red if cannot be placed here
      if(currentScheduleItem.conceptCollidesWithOthers()) {
        currentScheduleItem.applyErrorGlow();
      }
    }
  });

  $('html').on('mouseup', function(event) {
    if(event.which == 1 && currentScheduleItem != null) {

      if(!currentScheduleItem.conceptCollidesWithOthers() && currentScheduleItem.checkEndAfterBegin(true) && currentScheduleItem.conceptDiffersWithOriginal()) {
        currentScheduleItem.acceptConcept();
        schedule.patchScheduleItemBackend(currentScheduleItem, true);
      } else {
        currentScheduleItem.resetConcept();
      }
      // Reset drag vars
      currentScheduleItem = null;
      side = null;
      itemOffset = null;
      rowTP = null;
      dragStartMoment = null;
    }
  });
}

IADAscheduleView.prototype.showStatusMessage = function(content, ajax_wait, delay) {
  var notification = this.scheduleContainer.find('.ajax-notification');
  notification.css('pointer-events', 'auto');

  if(this.statusMessageTimeout != null) {
    // There is still a status message hide timeout present, clear it
    clearTimeout(this.statusMessageTimeout);
  }

  if(ajax_wait) {
     notification.find('.ajax-wait').show();
  } else {
     notification.find('.ajax-wait').hide();
  }

  notification.find('.message').html(content);

  var currentNotifyHeight = notification.height();
  notification.css({height: 0, visibility: 'visible'});
  notification.finish();
  notification.animate({height: currentNotifyHeight + 'px'}, 200);
  var schedule = this;
  if(delay != null && delay > 0) {
    this.statusMessageTimeout = setTimeout(function() {schedule.hideStatusMessage();}, delay);
  }
  return notification;
}

IADAscheduleView.prototype.hideStatusMessage = function() {
  var notification = this.scheduleContainer.find('.ajax-notification');
  notification.finish();
  notification.animate({height: 0}, 200, function(){
    $(this).css({visibility: 'hidden', height: 'auto'})
    // remove message
    notification.find('.message').html('');
    notification.find('.ajax-wait').hide();
    notification.css('pointer-events', 'inherit');
  });

}

IADAscheduleView.prototype.patchScheduleItemBackend = function(scheduleItem, undo) {
  var schedule = this;

  // saving status message
  schedule.showStatusMessage(jsLang.schedule_view.being_saved, true);

  $.ajax({
    type: 'PATCH',
    url: this.options.patch_reservation_url  + '/' + scheduleItem.item_id + '.json',
    data: scheduleItem.railsDataExport(),
    success: function(response) {
      if(undo) {
        var notify = schedule.showStatusMessage(jsLang.schedule_view.saved + ' (<a href="">' + jsLang.schedule_view.undo + '</a>)', false, 10000);
        notify.find('a').on('click', function(e) {e.preventDefault(); schedule.undoSaveAction(scheduleItem); return false;});
      } else {
        schedule.showStatusMessage(jsLang.schedule_view.saved, false, 10000);
      }
    },
    error: function(response) {
      schedule.hideStatusMessage();
      schedule.showStatusMessage(jsLang.schedule_view.saving_error, false, 10000);
    },
  });
}

IADAscheduleView.prototype.undoSaveAction = function(scheduleItem) {
  scheduleItem.undoAcceptConcept();
  this.patchScheduleItemBackend(scheduleItem);
}

IADAscheduleView.prototype.bindNewReservationControls = function() {
  var newScheduleItem = null;
  var schedule = this;
  this.scheduleContainer.find('.schedule-body').on('mousedown', 'div.row-schedule-object-item-parts', function(event) {
    // check if left mouse button, starting a new item and check if not clicked on other reservation
    if(event.which == 1 && newScheduleItem == null && $(event.target).hasClass('row-schedule-object-item-parts')) {
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

  this.scheduleContainer.find('.schedule-body').on('mousemove', 'div.row-schedule-object-item-parts', function(event) {
    var offset = $(this).offset();
    var relX = event.pageX - offset.left;
    if(newScheduleItem != null) {
      var newEnd = schedule.nearestMomentPoint(relX, this);
      if(newEnd.unix() != newScheduleItem.conceptEnd.unix()) {
        newScheduleItem.conceptEnd = newEnd;
        if(newScheduleItem.checkEndAfterBegin(true)) {
          newScheduleItem.rerender(true); // rerender in concept mode
          if(newScheduleItem.conceptCollidesWithOthers()) {
            newScheduleItem.applyErrorGlow();
          }
        }
      }
    }
  });

  var reservationForm = null;
  $('html').on('mouseup', function(event) {
    // Handle new entry
    if(reservationForm == null) {
      if(newScheduleItem != null && newScheduleItem.checkEndAfterBegin(true) && !newScheduleItem.conceptCollidesWithOthers()) {
        reservationForm = openModal('new_reservation_popup', $('#reservation-form-modal-blueprint').data('blueprint') ,function(e) {
          e.preventDefault();
          if(newScheduleItem != null) {
            newScheduleItem.removeFromDom();
            newScheduleItem = null;
          }
          closeModal(e);
          reservationForm = null;
        });
        APP.global.initializeDateTimePickers(reservationForm);
        schedule.setNewReservationForm(reservationForm, newScheduleItem);
        newScheduleItem.removeFromDom();
        newScheduleItem = null;
      } else {
        if(newScheduleItem != null) {
          newScheduleItem.removeFromDom();
          newScheduleItem = null;
        }
      }
    }
  });
}

IADAscheduleView.prototype.setNewReservationForm = function(reservationForm, newScheduleItem) {
  var schedule = this;
  var beginJDate = newScheduleItem.getConceptBegin().toDate();
  var endJDate = newScheduleItem.getConceptEnd().toDate();

  reservationForm.find('input#begins_at_date').datepicker("setDate", beginJDate);
  reservationForm.find('input#begins_at_tod').timepicker("setTime", beginJDate);
  reservationForm.find('input#ends_at_date').datepicker("setDate", endJDate);
  reservationForm.find('input#ends_at_tod').timepicker("setTime", endJDate);

  reservationForm.find('select').cwicDropdown();

  APP.reservations.organisationClientDropdown();

  reservationForm.find('select#reservation_entity_id').val(newScheduleItem.schedule_object_id);

  // Bind new client link
  reservationForm.find('a#new_organisation_client_link'). on('click', function(e){
    e.preventDefault();
    // Change the name of the submit button and submit by clicking it
    reservationForm.find('input[name="full"]').attr('name', 'full_new_client').click();
    return false;
  });

  reservationForm.find('input[name="commit"]').on('click', function(e){ e.preventDefault(); schedule.createScheduleItem(reservationForm, newScheduleItem); return false; });

  reservationForm.find('select').trigger('change');
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

  // save the selected domain length for navigation (next and previous)
  this.customDomainLength = newEndMoment.diff(newBeginMoment, 'days');
  this.navigationReference = this.beginDate;

  this.updateSchedule();
}

IADAscheduleView.prototype.setErrorField =  function(field, error) {
  if(field.parent().hasClass('field_with_errors')) {
    field.unwrap();
  }
  if(error) {
    field.wrap($('<div>', {'class': 'field_with_errors'}));
  }
}

IADAscheduleView.prototype.afterEntitiesLoad = function(response) {
  this.entities = response.entities;
  var possibleEntities = [];
  for(var entnr in response.entities) {
    var entity = response.entities[entnr];
    var jentity = this.getTemplateClone('entityButtonTemplate');
    possibleEntities.push(entity.id);
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
  // Handle entity that is selected by the url
  if(this.scheduleContainer.data('target-entity') != '' && possibleEntities.indexOf(parseInt(this.scheduleContainer.data('target-entity'))) > -1) {
    var selEntId = parseInt(this.scheduleContainer.data('target-entity'));
    this.scheduleContainer.find('.entity-container .entity-button').each(function() {
      jent = $(this);
      if(jent.attr('id') == 'entity_' + selEntId) {
        jent.addClass('active').css('border-color', jent.data('entity-color'));
      } else {
        jent.removeClass('active').css({'border-color': '', 'border-bottom-color': jent.data('entity-color')});
      }
    });
    this.selectedEntities = [selEntId];
  }

  this.updateSchedule();
}

IADAscheduleView.prototype.addTimeAxis = function() {
  var scheduleContainer = $(this.scheduleContainer);
  var timeAxis = $(this.scheduleContainer).find('.time-axis');
  var timeAxisHours = $(this.scheduleContainer).find('.time-axis > .hours');

  var parts = (this.options.zoom == 'day') ? 24 : 28;

  for(var i = 1; i < parts; i += 1) {
    if(this.options.zoom == 'day') {
      var timepart = this.getTemplateClone('hourTimeAxisFrameTemplate');
      timepart.data('hour', i).find('p.time').text(i);
    } else {
      var timepart = this.getTemplateClone('sixHourTimeAxisFrameTemplate');
      timepart.data('hour', i % 4);
      timepart.data('day', i / 4);
      timepart.find('p.time').text((i * 6) % 24);
    }

    timeAxisHours.append(timepart);
  }

  if(this.options.zoom == 'week') {
    for(var i = 0; i < 7; i++) {
      var dayPart = this.getTemplateClone('dayTimeAxisFrameTemplate');
      dayPart.css('left', (i * 14.285714) + '%');
      dayPart.find('p.name').text(moment().weekday(i).format('dddd'));
      timeAxisHours.append(dayPart);
    }
    // adjust height of hour time axis
    this.scheduleContainer.find('div.time-axis').height(this.scheduleContainer.find('div.time-axis div.day-time-axis-frame').outerHeight());
  }

  timeAxis.cwicSticky();
}


IADAscheduleView.prototype.createSchedule = function() {
  if(this.options.zoom == 'day') {
    this.createScheduleDay();
  } else {
    this.createScheduleWeek();
  }
}

IADAscheduleView.prototype.createScheduleDay = function() {
  var days = this.getDatesBetween(this.beginDate, this.endDate, true);
  for(var daynr in days) {
    this.appendDay(days[daynr]);
    if(moment(days[daynr]).startOf('day').unix() == moment().startOf('day').unix()) {
      this.showCurrentTimeNeedle();
    }
  }
  this.scheduleContainer.find('.schedule-body').css('height', 'auto');

}

IADAscheduleView.prototype.createScheduleWeek = function() {
  var weeks = this.getWeeksBetween(this.beginDate, this.endDate);
  for(var weeknr in weeks) {
    this.appendWeek(weeks[weeknr]);
    if(moment(weeks[weeknr]).startOf('week').unix() == moment().startOf('week').unix()) {
      this.showCurrentTimeNeedle();
    }
  }
  this.scheduleContainer.find('.schedule-body').css('height', 'auto');

}

IADAscheduleView.prototype.getWeeksBetween = function(begin, end) {
  var weeks = [];
  var currentMoment = moment(begin).startOf('week');

  var nrweeks = moment(end).endOf('week').diff(currentMoment, 'weeks');

  for(var weeknr = 0; weeknr <= nrweeks; weeknr++) {
    weeks.push(currentMoment);
    currentMoment = moment(currentMoment).add('weeks', 1);
  }
  return weeks;
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
  this.scheduleContainer.find('.left-axis').html('');
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
  this.scheduleContainer.find('.schedule-body').append($('<div></div>', {'class': 'disabled-overlay', text: jsLang.schedule_view.no_objects}));
}

IADAscheduleView.prototype.removeFocusFromAllScheduleItems = function() {
  this.scheduleContainer.find('div.schedule-item.open').removeClass('open');
  this.focusedScheduleItem = null;
}

IADAscheduleView.prototype.updateScheduleItemFocus = function() {
  // Check if an item is opened
  if(this.scheduleContainer.find('div.schedule-item.open').length > 0) {
    this.scheduleContainer.find('div.schedule-item:not(.open) .resizer.left, div.schedule-item:not(.open) .resizer.right').css('cursor', 'auto');
    this.scheduleContainer.find('div.schedule-item:not(.open)').css('cursor', 'auto').animate({opacity: 0.6}, 200);
    this.scheduleContainer.find('div.schedule-item.open').animate({opacity: 1}, 200);
  } else {
    this.scheduleContainer.find('div.schedule-item:not(.open) .resizer.left').css('cursor', 'w-resize');
    this.scheduleContainer.find('div.schedule-item:not(.open) .resizer.right').css('cursor', 'e-resize');
    this.scheduleContainer.find('div.schedule-item').css('cursor', 'move').animate({opacity: 1}, 200);
  }
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
    var newSchObjItemParts = schedule.getTemplateClone('rowScheduleObjectItemPartsTemplate');
    newSchObjItemParts.addClass('scheduleObject_' + sobjId);
    newSchObjItemParts.data('scheduleObjectID', sobjId);
    newSchObjItemParts.find('p.name').text(sobj.schedule_object_name);
    $(schedule.scheduleContainer).find('div.row div.row-schedule-objects').append(newSchObjItemParts);
  });

  // Adjust height of object rows based on the number of objects that are being selected.
  var schobjSize = $.size(schobjJSON);
  if(schobjSize != null) {
    if(schobjSize == 1) {
      this.scheduleContainer.find('.row-schedule-object-item-parts').css('height', '60px');
    } else if(schobjSize == 2) {
      this.scheduleContainer.find('.row-schedule-object-item-parts').css('height', '30px');
    } else {
      this.scheduleContainer.find('.row-schedule-object-item-parts').css('height', '20px');
      this.scheduleContainer.find('.left-axis .left-axis-row:not(.today)').height(this.scheduleContainer.find('.row:not(.today)').outerHeight());
      this.scheduleContainer.find('.left-axis .left-axis-row.today').height(this.scheduleContainer.find('.row.today').outerHeight());
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

IADAscheduleView.prototype.rowTimeToPercentage = function(currentMoment) {
  var max = moment(currentMoment).endOf(this.options.zoom).diff(moment(currentMoment).startOf(this.options.zoom));
  return moment(currentMoment).diff(moment(currentMoment).startOf(this.options.zoom)) / max * 100.0;
}

IADAscheduleView.prototype.rowTimePercentageSpan = function(beginMoment, endMoment) {
  var max = moment(beginMoment).endOf(this.options.zoom).diff(moment(beginMoment).startOf(this.options.zoom));
  return moment(endMoment).diff(beginMoment) / max * 100.0;
}

IADAscheduleView.prototype.getTemplateClone = function(id) {
  var newitem = $('#schedule-templates').find('#' + id).clone();
  newitem.removeAttr('id');
  newitem.show();
  return newitem;
}

IADAscheduleView.prototype.getDatesBetween = function(begin, end, inclusive) {
  var nrdays = moment(end).endOf('day').diff(moment(begin).startOf('day'), 'days');
  if(!inclusive && this.isStartOfDay(end)) {
    // End is start of day, meaning it actually is the end of the previous day. Decrease nrdays.
    nrdays -= 1;
  }
  var days = [];
  var currentMoment = moment(begin).startOf('day');
  // Also include last day, so <=
  for(var daynr = 0; daynr <= nrdays; daynr++) {
    days.push(currentMoment);
    currentMoment = moment(currentMoment).add('days', 1);
  }
  return days;
}

IADAscheduleView.prototype.isStartOfDay = function(date) {
  // Checks if the date is at the start of day (time = 00:00:00). This is useful for end dates, since this means they end at the previous day.
  return (moment(date).startOf('day').unix() == moment(date).unix());
}

IADAscheduleView.prototype.appendDay = function(dayMoment) {
  var dayAxisDiv = this.getTemplateClone('dayAxisRowTemplate');
  dayAxisDiv.attr('id', 'label_' + dayMoment.format('YYYY-MM-DD'));
  dayAxisDiv.find('div.day-name p').text(dayMoment.format('dd'));
  dayAxisDiv.find('div.day-nr p').text(dayMoment.format('D'));
  dayAxisDiv.find('div.month-name p').text(dayMoment.format('MMM'));

  this.scheduleContainer.find('.left-axis').append(dayAxisDiv);

  var row = this.getTemplateClone('rowTemplate');
  $(row).attr('id', dayMoment.format('YYYY-MM-DD'));

  for(var i = 0; i < 24; i += 1) {
    var hourpart = this.getTemplateClone('hourTimeFrameTemplate');
    hourpart.attr('id', 'hour_'+ i);
    hourpart.data('time', (i < 10 ? '0' + i : i) + ':00');
    $(row).find('.row-time-parts').append(hourpart);
  }

  this.scheduleContainer.find('.schedule-body').append(row);

  var timeAxis = this.scheduleContainer.find('.time-axis');
  timeAxis.parent().css({marginLeft: this.scheduleContainer.find('.left-axis').outerWidth() + 'px'});
}

IADAscheduleView.prototype.appendWeek = function(weekMoment) {
  var weekAxis = this.getTemplateClone('weekAxisRowTemplate');
  weekAxis.attr('id', 'label_' + weekMoment.format('GGGG-WW'));
  weekAxis.find('div.week-begin p').text(moment(weekMoment).startOf('week').format('l'));
  weekAxis.find('div.week-nr p').text(weekMoment.format('W'));
  weekAxis.find('div.week-end p').text(moment(weekMoment).endOf('week').format('l'));

  this.scheduleContainer.find('.left-axis').append(weekAxis);

  var row = this.getTemplateClone('rowTemplate');
  $(row).attr('id', weekMoment.format('GGGG-WW'));

  for(var i = 0; i < 28; i += 1) {
    var rowpart = this.getTemplateClone('sixHourTimeFrameTemplate');
    rowpart.data('time', ((i * 6) % 24) + ':00');
    rowpart.data('day', i / 4);

    // zebra striping for week days
    if(Math.floor(i / 4) % 2 == 0) {
      rowpart.addClass('even');
    }

    if(i % 4 == 0) {
      rowpart.addClass('end-day');
    }
    $(row).find('.row-time-parts').append(rowpart);
  }

  this.scheduleContainer.find('.schedule-body').append(row);

  var timeAxis = this.scheduleContainer.find('.time-axis');
  timeAxis.parent().css({marginLeft: this.scheduleContainer.find('.left-axis').outerWidth() + 'px'});
}

IADAscheduleView.prototype.showCurrentTimeNeedle = function() {
  var currentDate = moment().format((this.options.zoom == 'day') ? 'YYYY-MM-DD' : 'GGGG-WW');
  var date_row = this.scheduleContainer.find('.row#' + currentDate);
  this.scheduleContainer.find('.left-axis-row.today:not(#label_' + currentDate + ')').removeClass('today');
  this.scheduleContainer.find('.row.today:not(#' + currentDate + ')').removeClass('today').removeClass('progress-bar');
  this.scheduleContainer.find('.row:not(#' + currentDate + ') .time-needle').remove();
  if(date_row.length != 0) {
    this.scheduleContainer.find('.left-axis .left-axis-row#label_' + currentDate).addClass('today');
    date_row.addClass('today').addClass('progress-bar');
    if(this.scheduleContainer.find('.time-needle').length <= 0) {
      var needle = $('<div>', {'class': 'time-needle', title: moment().toDate().toLocaleString(), style: 'left: ' + this.rowTimeToPercentage(moment()) + '%;'});
      date_row.append(needle);
    } else {
      this.scheduleContainer.find('.time-needle').css({left: this.rowTimeToPercentage(moment()) + '%'});
    }
    var schedule = this;
    setTimeout(function() {schedule.showCurrentTimeNeedle();}, 30000);
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
        $(this).siblings('.entity-description').animate({height: 0}, 200, function(){
          $(this).css({display: 'none', height: 'auto'}).removeClass('opened');
        });
      } else {
        descriptionHeight = $(this).siblings('.entity-description').height();
        $(this).siblings('.entity-description').css({height: 0, display: 'block'}).animate({height: descriptionHeight}, 200, function() {
          $(this).css({height: 'auto'});
        }).addClass('opened');
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
          progressBar.append($('<div>', {'class': 'day-separator', style: 'left: '+ reservation.day_separators[daysep_nr] +'%'}));
        }
      }
    }

    // Set progressbar
    currentInfo.find('.progress-bar span').css('width', reservation.progress + '%');

    parentdiv.append(currentInfo);
    if(entity.upcoming_reservations.today.length  > 0 || entity.upcoming_reservations.tomorrow.length  > 0) {
      parentdiv.append($('<div>', {'class': 'reservation-separator'}));
    }
  }

  if(entity.upcoming_reservations.today.length  > 0 || entity.upcoming_reservations.tomorrow.length  > 0) {
    var nextInfo = this.getTemplateClone('nextReservationsTemplate');

    for(up_nr in entity.upcoming_reservations.today) {
      var line = this.getTemplateClone('reservationLineTemplate');
      line.find('span.time').text(moment(entity.upcoming_reservations.today[up_nr].begin_moment).format('HH:mm') + ' - ' + moment(entity.upcoming_reservations.today[up_nr].end_moment).format('HH:mm'));
      line.find('span.description').text(entity.upcoming_reservations.today[up_nr].description);
      nextInfo.append(line);
    }

    if(entity.upcoming_reservations.tomorrow.length  > 0) {
      nextInfo.append(this.getTemplateClone('tomorrowLineTemplate'));
      for(up_nr in entity.upcoming_reservations.tomorrow) {
        var line = this.getTemplateClone('reservationLineTemplate');
        line.find('span.time').text(moment(entity.upcoming_reservations.tomorrow[up_nr].begin_moment).format('HH:mm') + ' - ' + moment(entity.upcoming_reservations.tomorrow[up_nr].end_moment).format('HH:mm'));
        line.find('span.description').text(entity.upcoming_reservations.tomorrow[up_nr].description);
        nextInfo.append(line);
      }
    }
    parentdiv.append(nextInfo);
  }
}

/////////////////// Toolbar buttons ///////////////////

IADAscheduleView.prototype.bindToolbarButtonActions = function() {
  var schedule = this;
  this.scheduleContainer.find('div.time-axis div.reservation-controls a.toolbar-button').on('click', function(event){
    event.preventDefault();
    var id = $(this).attr('id');
    switch(id) {
      case 'description':
        schedule.informationScheduleItem();
        break;
      case 'client':
        schedule.gotoClientScheduleItem();
        break;
      case 'edit':
        schedule.editScheduleItem();
        break;
      case 'remove':
        schedule.removeScheduleItem();
        break;
    }
    return false;
  });
}

IADAscheduleView.prototype.removeScheduleItem = function() {
  if(this.focusedScheduleItem != null) {
    var schedule = this;
    var confirm = window.confirm(function(item_id){var str = jsLang.schedule_view.delete_confirm; return str.replace('%{item_id}', item_id)}(schedule.focusedScheduleItem.item_id));
    if (confirm == true) {
      this.showStatusMessage(jsLang.schedule_view.deleting, true);
      $.ajax({
        url: schedule.options.patch_reservation_url + '/' + schedule.focusedScheduleItem.item_id + '.json',
        type: 'DELETE',
        success: function(result) {
          schedule.showStatusMessage(jsLang.schedule_view.deleted, false, 5000);
          schedule.focusedScheduleItem.removeFromDom();
          delete schedule.scheduleItems[schedule.focusedScheduleItem.schedule_object_id][schedule.focusedScheduleItem.item_id];
          schedule.closeToolbar();
        },
        fail: function() {
          schedule.showStatusMessage(jsLang.schedule_view.error_deleting, false, 10000);
        },
      });
    } else {
      return false;
    }
  }
}

IADAscheduleView.prototype.createScheduleItem = function(reservationForm) {
  var reservationForm = $(reservationForm);
  $.ajax({
        url: schedule.options.patch_reservation_url + '.json',
        type: 'POST',
        data: {
          reservation: {
            description: reservationForm.find('input[name="reservation[description]"]').val(),
            begins_at_date: reservationForm.find('input[name="reservation[begins_at_date]"]').val(),
            begins_at_tod: reservationForm.find('input[name="reservation[begins_at_tod]"]').val(),
            ends_at_date: reservationForm.find('input[name="reservation[ends_at_date]"]').val(),
            ends_at_tod: reservationForm.find('input[name="reservation[ends_at_tod]"]').val(),
            entity_id: reservationForm.find('select[name="reservation[entity_id]"]').val(),
            organisation_client_id: reservationForm.find('input[name="reservation[organisation_client_id]"]').val(),
          },
          organisation_id: this.options.organisation_id,
        },
        success: function(result) {
          returnedScheduleItem = new IADAscheduleViewItem(schedule, result.entity_id);
          schedule.scheduleItems[result.entity_id][result.id] = returnedScheduleItem;
          returnedScheduleItem.parseFromJSON(result);
          returnedScheduleItem.render();
          closeModal();
        },
        fail: function(data) {
          console.log(data);
        },
      });

}

IADAscheduleView.prototype.editScheduleItem = function() {
  var path = this.options.patch_reservation_url + '/' + this.focusedScheduleItem.item_id + '/edit';
  if (typeof(Turbolinks) != 'undefined') {
    Turbolinks.visit(path);
  } else {
    window.location.href = path;
  }
}

IADAscheduleView.prototype.informationScheduleItem = function() {
  var path = this.options.patch_reservation_url + '/' + this.focusedScheduleItem.item_id;;
  if (typeof(Turbolinks) != 'undefined') {
    Turbolinks.visit(path);
  } else {
    window.location.href = path;
  }
}

IADAscheduleView.prototype.gotoClientScheduleItem = function() {
  var path = this.options.organisation_client_url + '/' + this.focusedScheduleItem.client_id;
  if (typeof(Turbolinks) != 'undefined') {
    Turbolinks.visit(path);
  } else {
    window.location.href = path;
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
  this.client_id = null;

  this.domObjects = [];


}

IADAscheduleViewItem.prototype.parseFromJSON = function(newItem) {
  this.begin = moment(newItem.begin_moment);
  this.end = moment(newItem.end_moment);
  this.bg_color = newItem.bg_color;
  this.text_color = newItem.text_color;
  this.description = newItem.description;
  this.client_id = newItem.client_id;
}

IADAscheduleViewItem.prototype.railsDataExport = function() {
  return {reservation: {
    reservation_id: this.item_id,
    begins_at: this.begin.format('YYYY-MM-DD HH:mm'),
    ends_at: this.end.format('YYYY-MM-DD HH:mm'),
  }};
}

IADAscheduleViewItem.prototype.applyErrorGlow = function() {
  $.each(this.domObjects, function(index, item) {
    item.addClass('error-glow');
  });
}

IADAscheduleViewItem.prototype.renderPart = function(jschobj, beginMoment, endMoment) {
  var newScheduleItem = this.schedule.getTemplateClone('scheduleItemTemplate');

  newScheduleItem.css('left', + this.schedule.rowTimeToPercentage(beginMoment) + '%');
  newScheduleItem.css('width', + this.schedule.rowTimePercentageSpan(beginMoment, endMoment) + '%');

  if(this.item_id != null) {
    // not new item, so background color
    newScheduleItem.css('background-color', this.bg_color);
    newScheduleItem.css('color', this.text_color);
    newScheduleItem.find('a').css('color', this.text_color);
  }

  // Add scheduleItem ID to DOM object
  newScheduleItem.data('scheduleItemID', this.item_id);

  var newScheduleItemText = newScheduleItem.find('a.item-text');
  if(this.show_url) {
    newScheduleItemText.attr('href', this.show_url);
  }


  newScheduleItem.attr('title', this.description);
  jschobj.append(newScheduleItem);

  // Width is only known after appending item to dom
  if(newScheduleItem.width() > this.schedule.options.min_description_width) {
    newScheduleItemText.text(this.description);
  } else {
    newScheduleItemText.hide();
  }

  return newScheduleItem;
}

IADAscheduleViewItem.prototype.acceptConcept = function() {
  this.undoBegin = this.begin;
  this.undoEnd = this.end;

  this.begin = this.getConceptBegin();
  this.end = this.getConceptEnd();

  this.rerender();
}

IADAscheduleViewItem.prototype.undoAcceptConcept = function() {
  if(this.undoBegin != null) {
    this.begin = this.undoBegin;
  }
  if(this.undoEnd != null) {
    this.end = this.undoEnd;
  }

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

IADAscheduleViewItem.prototype.applyTimeDiffConcept = function(milliseconds) {
  this.conceptBegin = moment(this.begin).add('ms', milliseconds);
  this.conceptEnd = moment(this.end).add('ms', milliseconds);
  this.rerender(true);
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

IADAscheduleViewItem.prototype.conceptDiffersWithOriginal = function() {
  return (this.begin.unix() != this.getConceptBegin().unix() || this.end.unix() != this.getConceptEnd().unix());
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

IADAscheduleViewItem.prototype.applyFocus = function() {
  this.schedule.removeFocusFromAllScheduleItems();
  $.each(this.domObjects, function(index, item){
    $(item).addClass('open');
  });
  this.schedule.focusedScheduleItem = this;
  this.schedule.updateScheduleItemFocus();
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

  // Also accept an item that stops on 0:00 the following day
  if(this.schedule.options.zoom == 'day') {
    var parts = this.schedule.getDatesBetween(currBegin, currEnd);
  } else {
    var parts = this.schedule.getWeeksBetween(currBegin, currEnd);
  }
  for(var parti in parts) {
    var part = parts[parti];
    if(this.schedule.options.zoom == 'day') {
      var container = this.scheduleContainer.find('#' + part.format('YYYY-MM-DD') + ' div.row-schedule-objects div.scheduleObject_' + this.schedule_object_id);
    } else {
      var container = this.scheduleContainer.find('#' + part.format('GGGG-WW') + ' div.row-schedule-objects div.scheduleObject_' + this.schedule_object_id);
    }
    // Check if the container is not present, this means not in current view, so skip
    if(container.length == 0) {
      continue;
    }
    if(parts.length == 1) {
      var schedulePart = this.renderPart(container, currBegin, currEnd);
      if(this.item_id != null) { // Do not show resizers when drawing new item
        if(schedulePart.width() > 30) {
          schedulePart.find('div.resizer.left').show();
          schedulePart.find('div.resizer.right').show();
        }
      }
    } else {
      switch(parseInt(parti)) {
        case 0:
          var schedulePart = this.renderPart(container, currBegin, moment(part).endOf(this.schedule.options.zoom));
          schedulePart.find('div.continue.right').show();
          if(this.item_id != null) { // Do not show resizers when drawing new item
            schedulePart.find('div.resizer.left').show();
          }
          break;
        case parts.length - 1:
          var schedulePart = this.renderPart(container, moment(part).startOf(this.schedule.options.zoom), currEnd);
          schedulePart.find('div.continue.left').show();
          if(this.item_id != null) { // Do not show resizers when drawing new item
            schedulePart.find('div.resizer.right').show();
          }
          break;
        default:
          var schedulePart = this.renderPart(container, moment(part).startOf(this.schedule.options.zoom), moment(part).endOf(this.schedule.options.zoom));
          schedulePart.find('div.continue').show();
          break;
      }
    }
    this.domObjects.push(schedulePart);
  }
}