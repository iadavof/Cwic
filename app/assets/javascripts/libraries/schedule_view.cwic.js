function CwicScheduleView(options) {
  this.options = $.extend({
    container: 'schedule-container',
    backend_url: 'url to backend',
    patch_reservation_url: 'url to reservations controller',
    view: 'horizontalCalendar',
    snap_part: '0.5',
    zoom: 'day'
  }, options || {});

  this.scheduleContainer = null;
  this.scheduleEntities = {};
  this.selectedEntities = [];
  this.beginDate = null;
  this.endDate = null;
  this.navigationReference;
  this.customDomainLength = null;
  this.needleTimeout = null;
  this.focusedScheduleItem = null;
  this.statusMessageTimeout = null;

  if(this.options.view == 'horizontalCalendar') {
    this.currentMode = (this.options.zoom == 'day') ? 'week' : 'month';
    this.renderHorizontalCalendar();
  } else if(this.options.view == 'verticalCalendar') {
    this.currentMode = 'week';
    this.renderVerticalCalendar();
  }
}

CwicScheduleView.prototype.renderHorizontalCalendar = function () {
  this.initScheduleStub();
  this.createEntityShowCase();
  this.bindControls();
  this.addHorizontalViewTimeAxis();
};

CwicScheduleView.prototype.renderVerticalCalendar = function() {
  this.initScheduleStub();
  this.createEntityShowCase();
  this.bindControls();
  this.addVerticalViewTimeAxis();
};

CwicScheduleView.prototype.initScheduleStub = function() {
  this.scheduleContainer = $('#' + this.options.container);
  this.scheduleContainer.append(this.getTemplateClone('scheduleContainerTemplate').contents());
  this.scheduleContainer.addClass('calendar  '+ this.options.view);

  // Set schedule to the selected date or current date
  this.navigationReference = this.getFocusMoment();
  this.setBeginAndEndFromNavigationReference();

  this.renderScheduleBodyGrid();
};

CwicScheduleView.prototype.getFocusMoment = function() {
  var now = moment().startOf('day');
  if(this.scheduleContainer.data('target-year') != '' && this.scheduleContainer.data('target-month') != '' && this.scheduleContainer.data('target-day') != '') {
    now.year(parseInt(this.scheduleContainer.data('target-year'), 10));
    now.month(parseInt(this.scheduleContainer.data('target-month'), 10) - 1);
    now.date(parseInt(this.scheduleContainer.data('target-day'), 10));
  } else if(this.scheduleContainer.data('target-year') != '' && this.scheduleContainer.data('target-week') != '') {
    now.isoWeekYear(parseInt(this.scheduleContainer.data('target-year'), 10));
    now.isoWeek(parseInt(this.scheduleContainer.data('target-week'), 10));
  }
  return now;
};

CwicScheduleView.prototype.setBeginAndEndFromNavigationReference = function() {
  if(this.currentMode == 'custom' && this.customDomainLength != null) {
    this.beginDate = moment(this.navigationReference).startOf(this.options.zoom);
    this.endDate = moment(this.navigationReference).add('days', this.customDomainLength).endOf(this.options.zoom);
  } else {
    this.beginDate = moment(this.navigationReference).startOf(this.currentMode).startOf(this.options.zoom);
    this.endDate = moment(this.navigationReference).endOf(this.currentMode).endOf(this.options.zoom);
  }
};

CwicScheduleView.prototype.toggleEntity = function(entity_button) {
  var entity_button = $(entity_button);
  var id = parseInt(entity_button.attr('id').split('_')[1], 10);

  if (this.options.view == "verticalCalendar") {
    // Only one item at once, first disable all
    this.toggleEntities(false);
  }

  if(this.scheduleEntities[id].getSelected()) {
    this.scheduleEntities[id].setSelected(false);
    this.removeSelectedEntity(id);
  } else {
    this.scheduleEntities[id].setSelected(true);
    this.addSelectedEntity(id);
  }

  this.updateSchedule();
};

CwicScheduleView.prototype.addSelectedEntity = function(id) {
  if(this.options.view == 'horizontalCalendar') {
      // Add this item to the selection
      this.selectedEntities.push(id);
    } else if(this.options.view == 'verticalCalendar') {
      // Only one entity can be selected
      this.selectedEntities = [id];
    }
  // Update the local storage
  this.setLocalStorageEntities(this.selectedEntities);
};

CwicScheduleView.prototype.clearSelectedEntities = function() {
  this.selectedEntities = [];
  this.setLocalStorageEntities(this.selectedEntities);
};

CwicScheduleView.prototype.removeSelectedEntity = function(id) {
  this.selectedEntities.splice($.inArray(id, this.selectedEntities), 1);
  // Update the local storage
  this.setLocalStorageEntities(this.selectedEntities);
};

CwicScheduleView.prototype.getEntitiesFromLocalStorage = function() {
  if(typeof(Storage) !== 'undefined' && typeof(localStorage.previouslySelectedEntities) !== 'undefined') {
    if(this.options.view == 'verticalCalendar' && localStorage.previouslySelectedEntities.length > 0) {
      // Only one selected entity possible, in case
      localStorage.previouslySelectedEntities = [localStorage.previouslySelectedEntities[localStorage.previouslySelectedEntities.length - 1]];
    }
    return localStorage.previouslySelectedEntities;
  }
  return [];
};

CwicScheduleView.prototype.setLocalStorageEntities = function() {
  if(typeof(Storage) !== 'undefined') {
    localStorage.previouslySelectedEntities = this.selectedEntities;
  }
};

CwicScheduleView.prototype.toggleCustomDomainControls = function() {
  var customDomainButton = this.scheduleContainer.find('div.control-container.navigate a#customMode');
  var controlContainer = this.scheduleContainer.find('div.control-container.domain');
  if(customDomainButton.hasClass('active')) {
    controlContainer.animate({height: controlContainer.find('div.inner').outerHeight() + 'px'}, 300, 'swing', function(){
      $(this).css('height', 'auto');
    });
  } else {
    controlContainer.animate({height: 0}, 300, 'swing');
  }
};

CwicScheduleView.prototype.toggleEntities = function(on) {
  // This function is only used in horizontal calendar mode where more entity items can be selected at once

  for(var enti in this.scheduleEntities) {
    ent = this.scheduleEntities[enti];
    ent.setSelected(on);
    if(on) {
      this.addSelectedEntity(ent.entity_id);
    }
  }
  if(!on) {
    this.clearSelectedEntities();
  }

  this.updateSchedule();
};

CwicScheduleView.prototype.createEntityShowCase = function() {
  var schedule = this;

  if(this.options.view == 'horizontalCalendar') {
    this.scheduleContainer.find('.entity-container a#selectAll').on('click', function(e){e.preventDefault(); schedule.toggleEntities(true); return false;});
    this.scheduleContainer.find('.entity-container a#selectNone').on('click', function(e){e.preventDefault(); schedule.toggleEntities(false); return false;});
  } else if(this.options.view == 'verticalCalendar') {
    this.scheduleContainer.find('.entity-container a#selectAll').hide();
    this.scheduleContainer.find('.entity-container a#selectNone').hide();
  }

  $.ajax({
    type: 'GET',
    url: this.options.backend_url  + '/entities'
  }).success(function(response) {
    schedule.afterEntitiesLoad(response);
  });
};

CwicScheduleView.prototype.bindControls = function() {
  var schedule = this;

  // Bind the controls for the date domain section of the navigation
  this.bindDateDomainControls();

  // Bind the controls for the previous/next page of the schedule navigation
  this.bindNavigationControls();

  // Bind the buttons in the expanding toolbar menu when clicking on a schedule item
  this.bindEditModeEvents();

  // Bind actions for creating a new reservation with the plus one button
  this.bindPlusOneButtonActions();

  // Perform the required actions on resize of the browser window
  this.bindOnResize();
};

CwicScheduleView.prototype.bindDateDomainControls = function() {
  // Bind datepickers on domain selection fields and set current domain
  this.scheduleContainer.find('#scheduleBeginDate').datepicker({showOn: 'both'});
  this.scheduleContainer.find('#scheduleEndDate').datepicker({showOn: 'both'});

  this.updateDateDomainControl();

  // Bind set date button
  this.scheduleContainer.find('#scheduleDateUpdate').click(function(){schedule.setDateDomain();});
};

CwicScheduleView.prototype.bindNavigationControls = function() {
  var navigation = this.scheduleContainer.find('.control-container.navigate');
  // Set the correct scope button to active
  navigation.find('a.button#' + this.currentMode + 'Mode').addClass('active');

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
        if(schedule.customDomainLength === null) {
          schedule.customDomainLength = moment(schedule.endDate).diff(schedule.beginDate, 'days');
        }
        schedule.navigationReference.subtract('days', schedule.customDomainLength);
      } else {
        schedule.navigationReference.subtract(schedule.currentMode + 's', 1);
      }
    }

    if(this.id == 'next') {
      if(schedule.currentMode == 'custom') {
        if(schedule.customDomainLength === null) {
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
};

CwicScheduleView.prototype.bindEditModeEvents = function() {
  var schedule = this;
  schedule.scheduleContainer.find('.schedule-body, .left-axis').each(function() {
    $(this).attr('data-original-padding-top', $(this).css('padding-top'));
  });
  schedule.scheduleContainer.find('.toolbar-close-button').on('click', function() {
    schedule.stopEditMode();
    return false;
  });

  this.bindStartStopEditModeOnClick();

  this.bindToolbarButtonActions();
};

CwicScheduleView.prototype.bindStartStopEditModeOnClick = function() {
  var schedule = this;
  this.scheduleContainer.find('.schedule-body').on('click', function(event) {
    var possibleScheduleItem = schedule.clickedScheduleItem(event);
    if(possibleScheduleItem) {
      // Op een schedule item geklikt, prevent the plus one button action from firing
      event.stopPropagation();
      if(schedule.focusedScheduleItem == null) {
        schedule.startEditMode(possibleScheduleItem);
      } else if(schedule.focusedScheduleItem.item_id != parseInt($(possibleScheduleItem).data('scheduleItemID'), 10)) {
        // A schedule item is currently being edited
        schedule.stopEditMode(function(){ schedule.startEditMode(possibleScheduleItem); });
      }
    } else {
      schedule.stopEditMode();
    }
  });
};

CwicScheduleView.prototype.clickedScheduleItem = function(event) {
  var possibleScheduleItem = $(event.target).closest('div.schedule-item');
  if(possibleScheduleItem.length > 0) {
    return possibleScheduleItem;
  } else return null;
};

CwicScheduleView.prototype.startEditMode = function(scheduleItemDOM, notWithToolbar) {
  notWithToolbar || false;

  if(scheduleItemDOM != null) {
    this.focusedScheduleItem = schedule.getScheduleItemForDOMObject(scheduleItemDOM);
  }

  if(!this.focusedScheduleItem) {
    return;
  }

  this.focusedScheduleItem.applyFocus();
  this.focusedScheduleItem.bindDragAndResizeControls();
  if(!notWithToolbar) {
    this.openToolbar();
  }
};

CwicScheduleView.prototype.stopEditMode = function(callback) {
  var schedule = this;

  callback = callback || function(){};

  if(this.focusedScheduleItem === null) {
    // Nothing focussed, return
    return;
  }

  this.focusedScheduleItem.unbindDragAndResizeControls();
  this.focusedScheduleItem.removeFocus();
  this.closeToolbar(function() {
    if(schedule.focusedScheduleItem !== null && schedule.focusedScheduleItem.conceptDiffersWithOriginal()) {
      schedule.focusedScheduleItem.acceptConcept();
      if(schedule.focusedScheduleItem.item_id) {
        // Item id is present, this is not a new schedule item, patch
        schedule.patchScheduleItemBackend(schedule.focusedScheduleItem, true);
      } else {
        // We have a new item and need to ask the reservation details
        schedule.handleNewScheduleItemSave();
        schedule.focusedScheduleItem.removeFromDom();
      }
    }
    schedule.focusedScheduleItem = null;
    callback();
  });
};

CwicScheduleView.prototype.handleNewScheduleItemSave = function() {
  var schedule = this;
  // Create a new instance of the reservation form
  var reservationForm = APP.modal.openModal('new_reservation_popup', $('#reservation-form-modal-blueprint').data('blueprint'));
  APP.global.initializeSpecialFormFields(reservationForm);
  schedule.setNewReservationForm(reservationForm, schedule.focusedScheduleItem);
};

CwicScheduleView.prototype.closeToolbar = function(callback) {
    schedule.scheduleContainer.find('.schedule-body, .left-axis').each(function() {
      $(this).animate({ 'padding-top': $(this).data('original-padding-top') }, 200);
    });
    this.scheduleContainer.find('div.top-axis div.reservation-controls').removeClass('open').animate({ height: 0 }, 200, callback);
};

CwicScheduleView.prototype.openToolbar = function() {
  var schedule = this;

  var timeAxis = schedule.scheduleContainer.find('.top-axis');
  var toolbar = timeAxis.find('div.reservation-controls');
  var toolbarHeight = toolbar.find('.inner').outerHeight();

  schedule.scheduleContainer.find('.schedule-body, .left-axis').each(function() {
    $(this).animate({ 'padding-top': parseInt($(this).data('original-padding-top'), 10) + toolbarHeight + 'px' }, 200);

  });
  toolbar.addClass('open').animate({ height: toolbarHeight + 'px' }, 200, function() {
    $(this).css({ height: 'auto' });
  });
};

CwicScheduleView.prototype.getZoomContainer = function(part, schedule_entity_id) {
  return this.scheduleContainer.find('#' + this.getContainerId(part) + ' div.schedule-objects div.scheduleEntity_' + schedule_entity_id);
};

CwicScheduleView.prototype.getContainerId = function(thismoment) {
  return thismoment.format(this.options.zoom == 'day' ? 'YYYY-MM-DD' : 'GGGG-WW');
};

CwicScheduleView.prototype.bindOnResize = function() {
  var schedule = this;
  var toolbar = schedule.scheduleContainer.find('.top-axis div.reservation-controls');
  $(window).on('resize', function() {
    schedule.scheduleContainer.find('.schedule-body, .left-axis').each(function() {
      $(this).css({'padding-top': parseInt($(this).data('original-padding-top'), 10) + toolbar.outerHeight() + 'px'});
    });

    schedule.setTopAxisTexts();
  });
};

CwicScheduleView.prototype.rerenderScheduleItems = function() {
  for(var scheId in this.scheduleEntities) {
    this.scheduleEntities[scheId].rerenderScheduleItems();
  }
};

CwicScheduleView.prototype.getZoomMinutes = function() {
  return (this.options.zoom == 'day') ? 1440 : 10080;
};

CwicScheduleView.prototype.updateDateDomainControl = function() {
  this.scheduleContainer.find('#scheduleBeginDate').datepicker("setDate", this.beginDate.toDate());
  this.scheduleContainer.find('#scheduleEndDate').datepicker("setDate", this.endDate.toDate());
};

CwicScheduleView.prototype.nearestMomentPoint = function(rel, clickedElement) {
  var containerTP = $(clickedElement);
  containerTPSize = this.options.view == 'horizontalCalendar' ? containerTP.width() : containerTP.height();

  var beginPoint;
  if(this.options.zoom == 'day') {
    beginPoint = moment(containerTP.parents('.row, .column').attr('id')).startOf('day');
  } else {
    beginPoint = moment(containerTP.parents('.row').attr('id'), 'GGGG-WW').startOf('week');
  }

  if(rel < 0) {
    // Begin of item is dragged to previous day
    beginPoint.subtract(this.options.zoom + 's', 1);
    rel += containerTPSize;
  }

  var dayMousePos = rel.toFixed() / containerTPSize;
  var minutes = Math.round(dayMousePos * this.getZoomMinutes());

  // Snap to snap interval
  minutes = (Math.round(minutes / this.getSnapLength()) * this.getSnapLength());

  return beginPoint.add(minutes, 'minutes');
};

CwicScheduleView.prototype.getSnapLength = function() {
  return (this.options.zoom == 'day') ? 60 * this.options.snap_part : 360 * this.options.snap_part;
};

CwicScheduleView.prototype.getScheduleItemForDOMObject = function(ScheDOM) {
  var jScheDOM = $(ScheDOM);
  var timePartDOM = jScheDOM.parents('.schedule-object-item-parts');
  var scheduleEntity = this.scheduleEntities[timePartDOM.data('scheduleEntityID')];
  var schId = jScheDOM.data('scheduleItemID');
  if(scheduleEntity != null && schId != null) {
    return scheduleEntity.getScheduleItemById(schId);
  }
  return null;
};

CwicScheduleView.prototype.getPointerRel = function(event, container) {
  var offset = $(container).offset();
  return (this.options.view == 'horizontalCalendar') ? event.originalEvent.pageX - offset.left : event.originalEvent.pageY - offset.top;
};

CwicScheduleView.prototype.getContainerForPoint = function(event) {
  var pointedElement = document.elementFromPoint(event.originalEvent.pageX, event.originalEvent.pageY);
  return $(pointedElement).closest('div.schedule-object-item-parts');
};

CwicScheduleView.prototype.getElementForPoint = function(event) {
  var pointedElement = document.elementFromPoint(event.originalEvent.pageX, event.originalEvent.pageY);
  return $(pointedElement);
};

CwicScheduleView.prototype.showStatusMessage = function(content, ajax_wait, delay) {
  var notification = this.scheduleContainer.find('.ajax-notification');
  notification.css('pointer-events', 'auto');

  if(this.statusMessageTimeout !== null) {
    // There is still a status message hide timeout present, clear it
    clearTimeout(this.statusMessageTimeout);
  }

  notification.find('.ajax-wait')[ajax_wait ? 'show' : 'hide']();

  notification.find('.message').html(content);

  var currentNotifyHeight = notification.height();
  notification.css({height: 0, visibility: 'visible'});
  notification.finish();
  notification.animate({height: currentNotifyHeight + 'px'}, 200);
  var schedule = this;
  if(delay !== null && delay > 0) {
    this.statusMessageTimeout = setTimeout(function() {schedule.hideStatusMessage();}, delay);
  }
  return notification;
};

CwicScheduleView.prototype.hideStatusMessage = function() {
  var notification = this.scheduleContainer.find('.ajax-notification');
  notification.finish();
  notification.animate({ height: 0 }, 200, function() {
    $(this).css({ visibility: 'hidden', height: 'auto' });
    // remove message
    notification.find('.message').html('');
    notification.find('.ajax-wait').hide();
    notification.css('pointer-events', 'inherit');
  });

};

CwicScheduleView.prototype.patchScheduleItemBackend = function(scheduleItem, undo) {
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
    }
  });
};

CwicScheduleView.prototype.isTouchDevice = function() {
  return Modernizr.touch;
};

CwicScheduleView.prototype.undoSaveAction = function(scheduleItem) {
  scheduleItem.undoAcceptConcept();
  this.patchScheduleItemBackend(scheduleItem);
};

CwicScheduleView.prototype.bindPlusOneButtonActions = function() {
  var schedule = this;

  var context = {
    reset: function() {
      this.plusOneButton = null;
      this.focusMoment = null;
      this.container = null;
      return this;
    },
    removePlusOneButton: function() {
      if(this.plusOneButton != null) {
        this.plusOneButton.remove();
        this.plusOneButton = null;
      }
      $('html').off('click.plusoneremove');
    }
  }.reset();

  this.scheduleContainer.find('.schedule-body').on('click', 'div.schedule-object-item-parts, div.schedule-item-wrapper', function(event) {
    schedule.plusOneActionCreatePlusOneButton(event, context);
  });

  this.scheduleContainer.find('.schedule-body').on('click', 'div.schedule-plus-one-button', function(event) {
    schedule.plusOneActionStartEditMode(event, context);
  });
};

CwicScheduleView.prototype.plusOneActionCreatePlusOneButton = function(event, context) {
    if(this.clickedScheduleItem(event)) {
      // We clicked on a schedule item, do nothing.
      return;
    }

    if(this.focusedScheduleItem == null && context.plusOneButton == null) {
      event.stopPropagation();
      context.container = this.getContainerForPoint(event);
      var rel = schedule.getPointerRel(event, context.container);
      context.focusMoment = this.nearestMomentPoint(rel, context.container);
      context.plusOneButton = schedule.getTemplateClone('plusOneButtonTemplate');

      // Set the correct position and dimensions of the plusone button
      context.plusOneButton.css(schedule.cssLeftOrTop(), schedule.timeToPercentage(moment(context.focusMoment).subtract(schedule.getSnapLength(), 'minutes')) + '%');
      context.plusOneButton.css(schedule.cssWidthOrHeight(), schedule.timePercentageSpan(moment(context.focusMoment).subtract(schedule.getSnapLength(), 'minutes'), moment(context.focusMoment).add(schedule.getSnapLength(), 'minutes')) + '%');

      // Add the button to the correct timeframe-entity container
      context.container.append(context.plusOneButton);

      // Add event handler to remove this plus one
      $('html').on('click.plusoneremove', function() { context.removePlusOneButton.call(context) });
    }
};

CwicScheduleView.prototype.plusOneActionStartEditMode = function(event, context) {
  event.stopPropagation();
  if(schedule.focusedScheduleItem == null) {
    var scheduleEntity = schedule.scheduleEntities[context.container.data('scheduleEntityID')];

    // Create a new scheduleItem for the selected time
    schedule.focusedScheduleItem = scheduleEntity.createNewScheduleItem();
    schedule.focusedScheduleItem.conceptBegin = moment(context.focusMoment).subtract(schedule.getSnapLength(), 'minutes');
    schedule.focusedScheduleItem.conceptEnd = moment(context.focusMoment).add(schedule.getSnapLength(), 'minutes');

    context.removePlusOneButton();
    context.reset();
    // Render the new created schedule item
    schedule.focusedScheduleItem.render(true);
    // End start edit mode for this item
    schedule.startEditMode(null, true);
  }
};

CwicScheduleView.prototype.setNewReservationForm = function(reservationForm, newScheduleItem, resetNewScheduleItem) {
  var schedule = this;
  var beginJDate = newScheduleItem.getConceptBegin().toDate();
  var endJDate = newScheduleItem.getConceptEnd().toDate();

  reservationForm.find('input#begins_at_date').datepicker("setDate", beginJDate);
  reservationForm.find('input#begins_at_tod').timepicker("setTime", beginJDate);
  reservationForm.find('input#ends_at_date').datepicker("setDate", endJDate);
  reservationForm.find('input#ends_at_tod').timepicker("setTime", endJDate);
  reservationForm.find('select#reservation_entity_id').val(newScheduleItem.scheduleEntity.entity_id);

  // Bind new client link
  reservationForm.find('a#new_organisation_client_link').on('click', function(e){
    e.preventDefault();
    // Change the name of the submit button and submit by clicking it
    reservationForm.find('input[name="full"]').attr('name', 'full_new_client').click();
    return false;
  });

  reservationForm.find('input[name="commit"]').on('click', function(e){ e.preventDefault(); schedule.createScheduleItem(reservationForm, resetNewScheduleItem); return false; });

  reservationForm.find('select').trigger('change');
};

CwicScheduleView.prototype.setDateDomain = function() {
  var beginDateField = this.scheduleContainer.find('#scheduleBeginDate');
  var endDateField = this.scheduleContainer.find('#scheduleEndDate');

  var newBeginMoment = moment(beginDateField.datepicker('getDate'));
  var newEndMoment = moment(endDateField.datepicker('getDate'));

  // Check if entered endDate is bigger than the entered beginDate
  if(moment(newEndMoment).startOf('day').isBefore(moment(newBeginMoment).startOf('day'))) {
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
};

CwicScheduleView.prototype.setErrorField =  function(field, error) {
  if(field.parent().hasClass('field_with_errors')) {
    field.unwrap();
  }
  if(error) {
    field.wrap($('<div>', {'class': 'field_with_errors'}));
  }
};

CwicScheduleView.prototype.getEntityTabContainer = function() {
  return this.scheduleContainer.find('.entity-container div#entity-showcase-tabs');
};

CwicScheduleView.prototype.createEntityShowCaseTab = function(ent_type_id, ent_type_name) {
  var ent_type_tab_id = 'entity_type_' + ent_type_id;
  var tabContainer = this.getEntityTabContainer();


  var navLink = $('<li><a href="#' + ent_type_tab_id + '">'+ ent_type_name +'</a></li>');
  tabContainer.find('ul.nav').append(navLink);

  currentTabContent = $('<div>', { id: ent_type_tab_id });
  tabContainer.find('div.tab-wrap').append(currentTabContent);

  return currentTabContent;
};

CwicScheduleView.prototype.afterEntitiesLoad = function(response) {
  var schedule = this;
  var tabContainer = this.getEntityTabContainer();
  if(response.entity_types.length > 0) {
    for(var ent_nr in response.entity_types) {
      var ent_type = response.entity_types[ent_nr];

      // Create a tab for the entity type
      entity_type_tab = this.createEntityShowCaseTab(ent_type.id, ent_type.name);

      // Previously selected entities are stored in local storage, lets retrieve them
      var locStorEntities = this.getEntitiesFromLocalStorage();

      for(var entnr in ent_type.entities) {
        var entity = ent_type.entities[entnr];
        var newEntity = new CwicScheduleViewEntity(this, ent_type.id, entity.id);
        newEntity.parseFromJSON(ent_type.entities[entnr]);

        // Render the showcasebutton
        var showCasebutton = newEntity.renderEntityShowcaseButton(entity_type_tab);

        // Bind on click event
        showCasebutton.on('click', function() {schedule.toggleEntity(this);});

        if(locStorEntities.indexOf(entity.id) > -1) {
          this.selectedEntities.push(entity.id);
          newEntity.setSelected(true);
        }

        this.scheduleEntities[entity.id] = newEntity;
      }
    }

    // Open first tab
    tabContainer.find('ul.nav li').first().addClass('current');

    // Initialize entity showcase tabs
    tabContainer.tabs();

    this.handleEntitySelectionByUrl();
    this.updateSchedule();

  } else {
    this.scheduleContainer.find('.entity-container p.no_entities_found').show();
    this.scheduleContainer.find('.entity-container div.fast-select').hide();
    tabContainer.hide();

    // Ook de button voor het aanmaken van een nieuwe reservering uitschakelen (hoewel dit eigenlijk een beetje abstractiebreuk is aangezien dit buiten de schedule container zit).
    $('a.button.new-reservation').hide();
  }
};

CwicScheduleView.prototype.handleEntitySelectionByUrl = function() {
  // Handle entity that is selected by the url
  if(this.scheduleContainer.data('target-entity') != '' && typeof this.scheduleEntities[parseInt(this.scheduleContainer.data('target-entity'), 10)] != 'undefined') {
    var selEntId = parseInt(this.scheduleContainer.data('target-entity'), 10);
    for(var enti in this.scheduleEntities) {
      var ent = this.scheduleEntities[enti];
      ent.setSelected(ent.entity_id == selEntId);
    }
    this.selectedEntities = [selEntId];
  }
};

CwicScheduleView.prototype.addVerticalViewTimeAxis = function() {
  // Add time in left axis

  var axis = this.scheduleContainer.find('div.left-axis');
  // We also use this function to update the schedule on resize, so clearing the old items
  axis.find('div.time').html('');
  for(var i = 1; i < 24; i += 1) {
    var hourpart = this.getTemplateClone('timeAxisRowTemplate');
    hourpart.data('time', (i < 10 ? '0' + i : i) + ':00');
    hourpart.find('div.time').text((i < 10 ? '0' + i : i) + ':00');
    axis.append(hourpart);
  }
};

CwicScheduleView.prototype.addHorizontalViewTimeAxis = function() {
  // Add time in top axis

  var scheduleContainer = $(this.scheduleContainer);
  var timeAxis = $(this.scheduleContainer).find('.top-axis');
  var timeAxisHours = $(this.scheduleContainer).find('.top-axis > .axis-parts');

  var parts = (this.options.zoom == 'day') ? 24 : 28;

  for(var i = 1; i < parts; i += 1) {
    var timepart;
    if(this.options.zoom == 'day') {
      timepart = this.getTemplateClone('hourTimeAxisFrameTemplate');
      timepart.data('hour', i).find('p.time').text(i);
    } else {
      timepart = this.getTemplateClone('sixHourTimeAxisFrameTemplate');
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
      dayPart.data('date', moment().weekday(i));
      timeAxisHours.append(dayPart);
    }

    // Set the header day texts
    this.setTopAxisTexts();

    // adjust height of hour time axis
    this.scheduleContainer.find('div.top-axis').height(this.scheduleContainer.find('div.top-axis div.day-time-axis-frame').outerHeight());
  }

  timeAxis.cwicStickyHeader();
};


CwicScheduleView.prototype.createSchedule = function() {
  if(this.options.view == 'horizontalCalendar') {
    (this.options.zoom == 'day') ? this.createScheduleDay() : this.createScheduleWeek();
  } else if(this.options.view == 'verticalCalendar') {
    this.createVerticalSchedule();
  }
};

CwicScheduleView.prototype.createVerticalSchedule = function() {
  var schedule = this;
  var days = this.getDatesBetween(this.beginDate, this.endDate, true);
  var nrOfDays = days.length;
  var dayWidth = 100.0 / nrOfDays;
  for(var daynr in days) {
    this.appendVerticalDay(days[daynr], dayWidth);
    if(moment(days[daynr]).isSame(moment(), 'day')) {
      this.showVerticalCurrentTimeNeedle();
      setInterval(function() { schedule.showVerticalCurrentTimeNeedle(); }, 30000);
    }
  }

  this.setTopAxisTexts();

  this.scheduleContainer.find('div.top-axis').cwicStickyHeader();
  this.scheduleContainer.find('div.top-axis').parent().css({marginLeft: this.scheduleContainer.find('.left-axis').outerWidth() + 'px'});
};

CwicScheduleView.prototype.createScheduleDay = function() {
  var schedule = this;
  var days = this.getDatesBetween(this.beginDate, this.endDate, true);
  for(var daynr in days) {
    this.appendDay(days[daynr]);
    if(moment(days[daynr]).isSame(moment(), 'day')) {
      this.showCurrentTimeNeedle();
      setInterval(function() { schedule.showCurrentTimeNeedle(); }, 30000);
    }
  }
  this.scheduleContainer.find('.schedule-body').css('height', 'auto');

};

CwicScheduleView.prototype.createScheduleWeek = function() {
  var schedule = this;
  var weeks = this.getWeeksBetween(this.beginDate, this.endDate);
  for(var weeknr in weeks) {
    this.appendWeek(weeks[weeknr]);
    if(moment(weeks[weeknr]).isSame(moment(), 'week')) {
      this.showCurrentTimeNeedle();
      setInterval(function() { schedule.showCurrentTimeNeedle(); }, 30000);
    }
  }
  this.scheduleContainer.find('.schedule-body').css('height', 'auto');

};

CwicScheduleView.prototype.getWeeksBetween = function(begin, end) {
  var weeks = [];
  var currentMoment = moment(begin).startOf('week');

  var nrweeks = moment(end).endOf('week').diff(currentMoment, 'weeks');

  for(var weeknr = 0; weeknr <= nrweeks; weeknr++) {
    weeks.push(currentMoment);
    currentMoment = moment(currentMoment).add('weeks', 1);
  }
  return weeks;
};

CwicScheduleView.prototype.loadscheduleEntities = function() {
  if(this.selectedEntities.length > 0) {
    schedule = this;

    $.ajax({
      type: 'POST',
      url: this.options.backend_url  + '/index_domain',
      data: {
        entity_ids: this.selectedEntities.join(','),
        schedule_begin: this.beginDate.format('YYYY-MM-DD'),
        schedule_end: this.endDate.format('YYYY-MM-DD')
      }
    }).success(function(response) {
      schedule.afterscheduleEntitiesLoad(response);
    });
  }
};

CwicScheduleView.prototype.clearSchedule = function() {
  if(this.needleTimeout !== null) {
     clearTimeout(this.needleTimeout);
  }
  var scheduleBody = this.scheduleContainer.find('.schedule-body');
  scheduleBody.css('height', scheduleBody.height());
  scheduleBody.children(':not("div.grid")').remove();
  if(this.options.view == 'horizontalCalendar') {
    this.scheduleContainer.find('.left-axis').html('');
  } else if(this.options.view == 'verticalCalendar') {
    this.scheduleContainer.find('.top-axis > .axis-parts').html('');
  }
};

CwicScheduleView.prototype.updateSchedule = function() {
  this.clearSchedule();
  if(this.selectedEntities.length > 0) {
    this.loadscheduleEntities();
    this.scheduleContainer.find('.schedule-body .disabled-overlay').remove();
  } else {
    this.createSchedule();
    this.disabledOverlay();
  }
  this.updateDateDomainControl();
};

CwicScheduleView.prototype.disabledOverlay = function() {
  this.scheduleContainer.find('.schedule-body').append($('<div></div>', {'class': 'disabled-overlay', text: jsLang.schedule_view.no_objects}));
};

CwicScheduleView.prototype.blurStateOnOtherScheduleItems = function(on) {
  if(on) {
    this.scheduleContainer.find('div.schedule-item-wrapper:not(.focused)').addClass('blurred');
  } else {
    this.scheduleContainer.find('div.schedule-item-wrapper').removeClass('blurred');
  }
};

CwicScheduleView.prototype.afterscheduleEntitiesLoad = function(response) {
  this.beginDate = moment(response.begin_date);
  this.endDate = moment(response.end_date);

  this.updateDateDomainControl();

  this.createSchedule();
  this.initscheduleEntityContainers(response.schedule_entities);
};

CwicScheduleView.prototype.initscheduleEntityContainers = function(scheJSON) {
  var schedule = this;
  // Add schedule entity container divs to the DOM
  $.each(scheJSON, function(scheId, sche) {
    // Get the entity object
    scheduleEntity = schedule.scheduleEntities[scheId];
    scheduleEntity.loadNewScheduleItemsFromJSON(sche.items);
    scheduleEntity.renderScheduleEntityContainer($(schedule.scheduleContainer).find('div.row div.schedule-objects, div.column div.schedule-objects'));
    scheduleEntity.renderScheduleItems();
  });

  if(this.options.view == 'horizontalCalendar') {
    scheduleEntity.setEntityContainerHeight($.size(scheJSON));
  }
};

CwicScheduleView.prototype.timeToPercentage = function(currentMoment) {
  var max = moment(currentMoment).endOf(this.options.zoom).diff(moment(currentMoment).startOf(this.options.zoom));
  return moment(currentMoment).diff(moment(currentMoment).startOf(this.options.zoom)) / max * 100.0;
};

CwicScheduleView.prototype.timePercentageSpan = function(beginMoment, endMoment) {
  var max = moment(beginMoment).endOf(this.options.zoom).diff(moment(beginMoment).startOf(this.options.zoom));
  return moment(endMoment).diff(beginMoment) / max * 100.0;
};

CwicScheduleView.prototype.minutesToPixels = function(scheduleItemDOM, minutes) {
  var dayRowTPwidth = scheduleItemDOM.parents('.schedule-object-item-parts').width();
  return dayRowTPwidth * (minutes / this.getZoomMinutes());
};

CwicScheduleView.prototype.getTemplateClone = function(id) {
  var newitem = $('#schedule-templates').find('#' + id).clone();
  newitem.removeAttr('id');
  newitem.show();
  return newitem;
};

CwicScheduleView.prototype.getDatesBetween = function(begin, end, inclusive) {
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
};

CwicScheduleView.prototype.isStartOfDay = function(date) {
  // Checks if the date is at the start of day (time = 00:00:00). This is useful for end dates, since this means they end at the previous day.
  return (moment(date).startOf('day').isSame(moment(date)));
};

CwicScheduleView.prototype.appendDay = function(dayMoment) {
  var dayAxisDiv = this.getTemplateClone('dayAxisRowTemplate');
  dayAxisDiv.attr('id', 'label_' + this.getContainerId(dayMoment));
  dayAxisDiv.find('div.day-name p').text(dayMoment.format('dd'));
  dayAxisDiv.find('div.day-nr p').text(dayMoment.format('D'));
  dayAxisDiv.find('div.month-name p').text(dayMoment.format('MMM'));

  this.scheduleContainer.find('.left-axis').append(dayAxisDiv);

  var row = this.getTemplateClone('rowTemplate');
  row.attr('id', this.getContainerId(dayMoment));

  this.scheduleContainer.find('.schedule-body').append(row);

  var timeAxis = this.scheduleContainer.find('.top-axis');
  timeAxis.parent().css({marginLeft: this.scheduleContainer.find('.left-axis').outerWidth() + 'px'});
}
;

CwicScheduleView.prototype.setTopAxisTexts = function() {
  topAxis = this.scheduleContainer.find('div.top-axis');
    var parts;
  if(this.options.view == 'verticalCalendar') {
    parts = topAxis.find('div.axis-parts div.vertical-day-time-axis-frame');

    parts.each(function() {
      var part = $(this);
      var width = part.width();
      var partMoment = moment(part.data('date'));

      if(width < 50) {
        part.find('p.name').text(partMoment.format('dd'));
        part.find('p.date').text(partMoment.format('D'));
      } else if( width <= 80) {
        part.find('p.name').text(partMoment.format('dd'));
        part.find('p.date').text(partMoment.format('Do'));
      } else if( width <= 120) {
        part.find('p.name').text(partMoment.format('dd'));
        part.find('p.date').text(partMoment.format('D MMM'));
      } else if(width <= 150) {
        part.find('p.name').text(partMoment.format('dddd'));
        part.find('p.date').text(partMoment.format('ll'));
      } else {
        part.find('p.name').text(partMoment.format('dddd'));
        part.find('p.date').text(partMoment.format('LL'));
      }

    });

  } else if(this.options.view == 'horizontalCalendar' && this.options.zoom == 'week') {
    parts = topAxis.find('div.axis-parts div.day-time-axis-frame');
    parts.each(function() {
      var part = $(this);
      var width = part.width();
      var partMoment = moment(part.data('date'));

      if( width <= 120) {
        part.find('p.name').text(partMoment.format('dd'));
      } else {
        part.find('p.name').text(partMoment.format('dddd'));
      }

    });
  }
};

CwicScheduleView.prototype.appendVerticalDay = function(dayMoment, dayWidth) {
  var topAxis = this.scheduleContainer.find('.top-axis > div.axis-parts');

  var dayPart = this.getTemplateClone('verticalDayTimeAxisFrameTemplate');
  dayPart.css('width', dayWidth + '%');

  // store the date in header item
  dayPart.attr('id', 'label_' + dayMoment.format('YYYY-MM-DD'));
  dayPart.data('date', dayMoment.format('YYYY-MM-DD'));

  dayPart.find('p.name').attr('title',dayMoment.format('dddd'));
  dayPart.find('p.date').attr('title',dayMoment.format('ll'));

  topAxis.append(dayPart);

  var column = this.getTemplateClone('columnTemplate');
  column.attr('id', dayMoment.format('YYYY-MM-DD'));

  column.css({ width: dayWidth + '%' });

  this.scheduleContainer.find('.schedule-body').append(column);
};

CwicScheduleView.prototype.renderScheduleBodyGrid = function() {
  var grid = this.scheduleContainer.find('div.schedule-body div.grid');
  var nritems = this.options.zoom == 'day' ? 23 : 27;
  for(var i = 0; i < nritems; i += 1) {
    var gridItem = this.getTemplateClone('gridItemTemplate');
    gridItem.addClass(this.options.view == 'horizontalCalendar' ? 'horizontal' : 'vertical');
    gridItem.addClass(this.options.zoom);
    grid.append(gridItem);
  }
};

CwicScheduleView.prototype.appendWeek = function(weekMoment) {
  var weekAxis = this.getTemplateClone('weekAxisRowTemplate');
  weekAxis.attr('id', 'label_' + this.getContainerId(weekMoment));
  weekAxis.find('div.week-begin p').text(moment(weekMoment).startOf('week').format('l'));
  weekAxis.find('div.week-nr p').text(weekMoment.format('W'));
  weekAxis.find('div.week-end p').text(moment(weekMoment).endOf('week').format('l'));

  this.scheduleContainer.find('.left-axis').append(weekAxis);

  var row = this.getTemplateClone('rowTemplate');
  $(row).attr('id', this.getContainerId(weekMoment));

  this.scheduleContainer.find('.schedule-body').append(row);

  var timeAxis = this.scheduleContainer.find('.top-axis');
  timeAxis.parent().css({marginLeft: this.scheduleContainer.find('.left-axis').outerWidth() + 'px'});
};

CwicScheduleView.prototype.showCurrentTimeNeedle = function() {
  var currentDate = this.getContainerId(moment());
  var date_row = this.scheduleContainer.find('.row#' + currentDate);
  this.scheduleContainer.find('.left-axis-row.today:not(#label_' + currentDate + ')').removeClass('today');
  this.scheduleContainer.find('.row.today:not(#' + currentDate + ')').removeClass('today');
  this.scheduleContainer.find('.row:not(#' + currentDate + ') .time-needle').remove();
  if(date_row.length !== 0) {
    this.scheduleContainer.find('.left-axis .left-axis-row#label_' + currentDate).addClass('today');
    date_row.addClass('today');
    if(this.scheduleContainer.find('.time-needle').length <= 0) {
      var needle = $('<div>', {'class': 'time-needle', title: moment().toDate().toLocaleString(), style: 'left: ' + this.timeToPercentage(moment()) + '%;'});
      date_row.append(needle);
    } else {
      this.scheduleContainer.find('.time-needle').css({left: this.timeToPercentage(moment()) + '%'});
    }
    var schedule = this;
  }
};

CwicScheduleView.prototype.showVerticalCurrentTimeNeedle = function() {
  var currentDate = this.getContainerId(moment());
  var date_column = this.scheduleContainer.find('.column#' + currentDate);
  this.scheduleContainer.find('.top-axis div.vertical-day-time-axis-frame.today:not(#label_' + currentDate + ')').removeClass('today');
  this.scheduleContainer.find('.column.today:not(#' + currentDate + ')').removeClass('today');
  this.scheduleContainer.find('.column:not(#' + currentDate + ') .time-needle').remove();
  if(date_column.length !== 0) {
    this.scheduleContainer.find('.top-axis div.vertical-day-time-axis-frame#label_' + currentDate).addClass('today');
    date_column.addClass('today');
    if(this.scheduleContainer.find('.time-needle').length <= 0) {
      var needle = $('<div>', {'class': 'time-needle', title: moment().toDate().toLocaleString(), style: 'top: ' + this.timeToPercentage(moment()) + '%;'});
      date_column.append(needle);
    } else {
      this.scheduleContainer.find('.time-needle').css({top: this.timeToPercentage(moment()) + '%'});
    }
    var schedule = this;
  }
};

/////////////////// Toolbar buttons ///////////////////

CwicScheduleView.prototype.bindToolbarButtonActions = function() {
  var schedule = this;
  this.scheduleContainer.find('div.top-axis div.reservation-controls a.toolbar-button').on('click', function(event){
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
        schedule.removeScheduleItem($(this));
        break;
    }
    return false;
  });
};

CwicScheduleView.prototype.removeScheduleItem = function(link) {
  if(this.focusedScheduleItem !== null) {
    var schedule = this;
    link.data('confirm', jsLang.schedule_view.delete_confirm.replace('%{item_id}', schedule.focusedScheduleItem.item_id));
    if($.rails.allowAction(link)) {
      this.showStatusMessage(jsLang.schedule_view.deleting, true);
      $.ajax({
        url: schedule.options.patch_reservation_url + '/' + schedule.focusedScheduleItem.item_id + '.json',
        type: 'DELETE',
        success: function(result) {
          schedule.showStatusMessage(jsLang.schedule_view.deleted, false, 5000);
          schedule.stopEditMode();
          schedule.focusedScheduleItem.destroy();
        },
        fail: function() {
          schedule.showStatusMessage(jsLang.schedule_view.error_deleting, false, 10000);
        }
      });
    } else {
      return false;
    }
  }
};

CwicScheduleView.prototype.createScheduleItem = function(reservationForm, resetNewScheduleItem) {
  var jreservationForm = $(reservationForm);
  $.ajax({
    url: schedule.options.patch_reservation_url + '.json',
    type: 'POST',
    data: {
      reservation: {
        description: jreservationForm.find('input[name="reservation[description]"]').val(),
        begins_at_date: jreservationForm.find('input[name="reservation[begins_at_date]"]').val(),
        begins_at_tod: jreservationForm.find('input[name="reservation[begins_at_tod]"]').val(),
        ends_at_date: jreservationForm.find('input[name="reservation[ends_at_date]"]').val(),
        ends_at_tod: jreservationForm.find('input[name="reservation[ends_at_tod]"]').val(),
        entity_id: jreservationForm.find('select[name="reservation[entity_id]"]').val(),
        organisation_client_id: jreservationForm.find('input[name="reservation[organisation_client_id]"]').val()
      },
      organisation_id: this.options.organisation_id
    },
    context: schedule,
    complete: function(xhr) {
      var result;
      if(xhr.status == 200) {
        result = JSON.parse(xhr.responseText);

        returnedScheduleItem = this.scheduleEntities[result.entity_id].createNewScheduleItem(result);

        // remove placeholder schedule item
        if(typeof nresetNewScheduleItem == 'Function') {
          resetNewScheduleItem();
        }

        returnedScheduleItem.render();
        APP.modal.closeModal();
      } else if(xhr.status == 422) { // validation error
        result = JSON.parse(xhr.responseText);
        if(typeof result.errors !== 'undefined') {
          var errorList = jreservationForm.find('div#error-explanation').css('display', 'block').find('ul');
          errorList.html('');
          for(index in result.errors) {
            var item = result.errors[index];
            if($.isArray(item.messages) && item.messages.length > 0) {
              jreservationForm.find('label[for="reservation_'+ index +'"]').wrap($('<div>', {'class': 'field_with_errors'}));
              for(itemIndex in item.messages) {
                errorList.append($('<li>', { html: item.messages[itemIndex] }));
              }
            }
          }
        }
      }
    },
    fail: function(data) {
      console.log(data);
    }
  });
};

CwicScheduleView.prototype.editScheduleItem = function() {
  var path = this.options.patch_reservation_url + '/' + this.focusedScheduleItem.item_id + '/edit';
  if (typeof(Turbolinks) != 'undefined') {
    Turbolinks.visit(path);
  } else {
    window.location.href = path;
  }
};

CwicScheduleView.prototype.informationScheduleItem = function() {
  var path = this.options.patch_reservation_url + '/' + this.focusedScheduleItem.item_id;
  if (typeof(Turbolinks) != 'undefined') {
    Turbolinks.visit(path);
  } else {
    window.location.href = path;
  }
};

CwicScheduleView.prototype.gotoClientScheduleItem = function() {
  var path = this.options.organisation_client_url + '/' + this.focusedScheduleItem.client_id;
  if (typeof(Turbolinks) != 'undefined') {
    Turbolinks.visit(path);
  } else {
    window.location.href = path;
  }
};

CwicScheduleView.prototype.cssLeftOrTop = function() {
  return (this.options.view == 'horizontalCalendar') ? 'left' : 'top';
};

CwicScheduleView.prototype.cssRightOrBottom = function() {
  return (this.options.view == 'horizontalCalendar') ? 'right' : 'bottom';
};

CwicScheduleView.prototype.cssWidthOrHeight = function() {
  return (this.options.view == 'horizontalCalendar') ? 'width' : 'height';
};
