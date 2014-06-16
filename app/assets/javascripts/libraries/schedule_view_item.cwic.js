function CwicScheduleViewItem(_schedule, _scheduleEntity, _item_id) {
  this.schedule = _schedule;
  this.scheduleContainer = _schedule.scheduleContainer;
  this.scheduleEntity = _scheduleEntity || null;
  this.item_id = _item_id || null;

  this.hidden = false;
  this.focused = false;

  this.begin = null; // momentjs object
  this.end = null; // momentjs object

  this.undoBegin = null; // momentjs object
  this.undoEnd = null; // momentjs object

  this.conceptBegin = null; // momentjs object
  this.conceptEnd = null; // momentjs object
  this.conceptMode = false; // momentjs object


  this.bg_color = null;
  this.text_color = null;
  this.blocking = true;
  this.description = '';
  this.client_id = null;

  // slack times in minutes
  this.slack_before = 0;
  this.slack_after = 0;

  this.status = null;

  this.domObjects = {};
}

CwicScheduleViewItem.prototype.parseFromJSON = function(newItem) {
  this.item_id = newItem.id;
  this.begin = moment(newItem.begin_moment);
  this.end = moment(newItem.end_moment);
  this.bg_color = newItem.bg_color;
  this.text_color = newItem.text_color;
  this.description = newItem.description;
  this.client_id = newItem.client_id;
  this.blocking = newItem.blocking;

  this.slack_before = newItem.slack_before;
  this.slack_after = newItem.slack_after;

  if(newItem.status) {
    this.status  = {
                      bg_color: newItem.status.bg_color,
                      text_color: newItem.status.text_color,
                      name: newItem.status.name
                    };
  }
};

CwicScheduleViewItem.prototype.railsDataExport = function() {
  return { reservation: {
      reservation_id: this.item_id,
      begins_at: this.begin.format('YYYY-MM-DD HH:mm'),
      ends_at: this.end.format('YYYY-MM-DD HH:mm')
    }
  };
};

CwicScheduleViewItem.prototype.setSlack = function(before, after) {
  this.slack_before = before;
  this.slack_after = after;
};

CwicScheduleViewItem.prototype.applyGlow = function(kind, on) {
  var domObjectsSItems = $(this.getDomObjects()).find('div.schedule-item');
  domObjectsSItems.toggleClass(kind + '-glow', on);
};

CwicScheduleViewItem.prototype.relativeSlackPercentage = function(slackBegin, begin, slackEnd) {
  var totalWrapperTimeLength = slackEnd.diff(slackBegin);
  var relativeSlackPercentage = 0;
  if(!slackBegin.isSame(begin)) {
    // We need to show start slack here
    relativeSlackPercentage = (begin.diff(slackBegin) / totalWrapperTimeLength) * 100;
  }
  return relativeSlackPercentage;
};

CwicScheduleViewItem.prototype.relativeSlackWidthPercentage = function(slackBegin, begin, end, slackEnd) {
  var totalWrapperTimeLength = slackEnd.diff(slackBegin);
  var itemTimeLength = end.diff(begin);
  return itemTimeLength / totalWrapperTimeLength * 100;
};

CwicScheduleViewItem.prototype.renderPart = function(jschobj, momentBlock) {
  var newScheduleItemWrapper = APP.util.getTemplateClone('scheduleItemTemplate');
  var newScheduleItem = newScheduleItemWrapper.find('div.schedule-item');

  this.setScheduleItemDimensions(newScheduleItemWrapper, momentBlock);

  this.addLayout(newScheduleItemWrapper, newScheduleItem);

  this.addStatusFlag(newScheduleItem);

  // Add scheduleItem ID to DOM object
  newScheduleItem.data('scheduleItemID', this.item_id);

  newScheduleItem.attr('title', this.description);
  newScheduleItem.find('p.item-text').text(this.description);

  jschobj.append(newScheduleItemWrapper);

  newScheduleItem.find('div.status').css('visibility', (newScheduleItem.width() < 40) ? 'hidden' : 'visible');

  return newScheduleItemWrapper;
};

CwicScheduleViewItem.prototype.addStatusFlag = function(scheduleItemDOM) {
  if(this.status != null) {
    scheduleItemDOM.find('div.status').show().attr('title', this.status.name).css({ backgroundColor: this.status.bg_color, color: this.status.text_color, borderColor: this.status.text_color }).find('span').text(this.status.name.substring(0,1));
  }
};

CwicScheduleViewItem.prototype.addLayout = function(newScheduleItemWrapper, newScheduleItem) {
  if(this.focused) {
    newScheduleItemWrapper.addClass('focused');
  }
  if(!this.blocking) {
    newScheduleItemWrapper.addClass('hidden');
  }

  if(this.bg_color !== null) {
    newScheduleItem.css('background-color', this.bg_color);
    newScheduleItem.find('.continue').css('background-color', this.bg_color);
  } else {
    newScheduleItemWrapper.addClass('concept');
  }
  if(this.text_color !== null) {
    newScheduleItem.css('color', this.text_color);
    newScheduleItem.find('a').css('color', this.text_color);
  }
};

CwicScheduleViewItem.prototype.acceptConcept = function() {
  this.undoBegin = this.begin;
  this.undoEnd = this.end;

  this.begin = this.getConceptBegin();
  this.end = this.getConceptEnd();

  this.scheduleEntity.checkUnhideNonBlockingItems();

  this.deepRerender();
};

CwicScheduleViewItem.prototype.undoAcceptConcept = function() {
  if(this.undoBegin !== null) {
    this.begin = this.undoBegin;
  }
  if(this.undoEnd !== null) {
    this.end = this.undoEnd;
  }

  this.resetConcept();
};

CwicScheduleViewItem.prototype.destroy = function() {
  this.scheduleEntity.destroyScheduleItem(this.item_id);
};

CwicScheduleViewItem.prototype.resetConcept = function() {
  this.conceptBegin = null;
  this.conceptEnd = null;
  this.scheduleEntity.checkUnhideNonBlockingItems();

  this.rerender(); // Rerender in normal mode
};

CwicScheduleViewItem.prototype.moveConceptTo = function(newBeginMoment) {
  if(newBeginMoment.isSame(this.getConceptBegin())) {
    // Nothing changed, move on
    return;
  }

  // Keep the duration of the item
  var duration = this.getConceptEnd().diff(this.getConceptBegin());

  this.conceptBegin = moment(newBeginMoment);
  this.conceptEnd = moment(newBeginMoment).add('ms', duration);

  this.rerender(true); // Rerender as concept
  this.schedule.scheduleItemChanged();
};

CwicScheduleViewItem.prototype.applyTimeDiffConcept = function(milliseconds) {
  this.conceptBegin = moment(this.getConceptBegin()).add('ms', milliseconds);
  this.conceptEnd = moment(this.getConceptEnd()).add('ms', milliseconds);
  this.rerender(true);
  this.schedule.scheduleItemChanged();
  return this.getDomObjects();
};

CwicScheduleViewItem.prototype.resizeConcept = function(side, newMoment) {
  if(side == 'backwards') {
    if(newMoment.isSame(this.getConceptBegin())) {
      // Nothing changed, move on
      return this.getDomObjects();
    }
    this.conceptBegin = moment(newMoment);
  } else {
    if(newMoment.isSame(this.getConceptEnd())) {
      // Nothing changed, move on
      return this.getDomObjects();
    }
    this.conceptEnd = moment(newMoment);
  }
  this.rerender(true);
  this.schedule.scheduleItemChanged();
  return this.getDomObjects();
};

CwicScheduleViewItem.prototype.conceptDiffersWithOriginal = function() {
  return !this.begin || !this.end || !this.begin.isSame(this.getConceptBegin()) || !this.end.isSame(this.getConceptEnd());
};

CwicScheduleViewItem.prototype.checkEndAfterBegin = function(concept) {
  var currBegin, currEnd;
  if(concept) {
    currBegin = this.getConceptBegin();
    currEnd = this.getConceptEnd();
    return currBegin.isBefore(currEnd);
  } else {
    currBegin = this.begin;
    currEnd = this.end;
  }
  if(currBegin === null || currEnd === null) {
    return false;
  }
  return this.begin.isBefore(this.end);
};

CwicScheduleViewItem.prototype.getConceptBegin = function() {
  return moment((this.conceptBegin !== null) ? this.conceptBegin : this.begin);
};

CwicScheduleViewItem.prototype.getConceptEnd = function() {
  return moment((this.conceptEnd !== null) ? this.conceptEnd : this.end);
};

CwicScheduleViewItem.prototype.getConceptSlackBegin = function() {
  return moment(this.getConceptBegin()).subtract('minutes', this.slack_before);
};

CwicScheduleViewItem.prototype.getConceptSlackEnd = function() {
  return moment(this.getConceptEnd()).add('minutes', this.slack_after);
};

CwicScheduleViewItem.prototype.getSlackBegin = function() {
  return moment(this.begin).subtract('minutes', this.slack_before);
};

CwicScheduleViewItem.prototype.getSlackEnd = function() {
  return moment(this.end).add('minutes', this.slack_after);
};

// This function has to be extended to check collision with first events just out of the current calendar scope
CwicScheduleViewItem.prototype.conceptCollidesWithOthers = function(slack) {
  var _this = this;

  var curConceptBegin = slack ? this.getConceptSlackBegin() : this.getConceptBegin();
  var curConceptEnd = slack ? this.getConceptSlackEnd() : this.getConceptEnd();
  var otherItemsForObject = this.scheduleEntity.scheduleItems;
  var collision = false;

  if(otherItemsForObject !== null) {
    $.each(otherItemsForObject, function(itemId, item) {
      // exclude self
      if(_this.item_id !== null && itemId == _this.item_id) {
        return true;
      }

      var itemBegin = slack ? item.getSlackBegin() : item.begin;
      var itemEnd = slack ? item.getSlackEnd() : item.end;

      if((itemBegin.isBefore(curConceptEnd) || itemEnd.isBefore(curConceptBegin)) && curConceptBegin.isBefore(itemEnd)) {
        if(item.blocking) {
          collision = true;
          return false; // Break out of each loop
        } else {
          item.setVisibilityDom(false);
          return true;
        }
      }
    });
  }

  return collision;
};

CwicScheduleViewItem.prototype.conceptSlackCollidesWithOthers = function() {
  return this.conceptCollidesWithOthers(true);
};

CwicScheduleViewItem.prototype.conceptCollidesWith = function(moment) {
  var curConceptBegin = this.getConceptBegin();
  var curConceptEnd = this.getConceptEnd();

  return ((curConceptBegin.isBefore(moment) || curConceptBegin.isSame(moment)) && curConceptEnd.isAfter(moment));
};

CwicScheduleViewItem.prototype.removeFromDom = function() {
  $(this.getDomObjects()).remove();
  this.domObjects = {};
};

CwicScheduleViewItem.prototype.setVisibilityDom = function(visible) {
  this.hidden = !visible;
  (visible) ? $(this.getDomObjects()).show() : $(this.getDomObjects()).hide();
};

CwicScheduleViewItem.prototype.getDomObjects = function() {
  return APP.util.arrayValues(this.domObjects);
};

CwicScheduleViewItem.prototype.applyFocus = function() {
  this.focused = true;
  var domOs = $(this.getDomObjects());
  domOs.addClass('focused');
  domOs.find('.resizer.left').css('cursor', 'w-resize');
  domOs.find('.resizer.right').css('cursor', 'e-resize');

  this.schedule.blurStateOnOtherScheduleItems(true);
};

CwicScheduleViewItem.prototype.removeFocus = function() {
  this.focused = false;
  var domOs = $(this.getDomObjects());
  domOs.removeClass('focused');
  domOs.find('.resizer.left').css('cursor', 'auto');
  domOs.find('.resizer.right').css('cursor', 'auto');

  this.schedule.blurStateOnOtherScheduleItems(false);
};

CwicScheduleViewItem.prototype.rerender = function(concept) {
  this.render(concept);
};

CwicScheduleViewItem.prototype.deepRerender = function(concept) {
  this.removeFromDom();
  this.render(concept);
};

CwicScheduleViewItem.prototype.showResizers = function(schedulePartWrapper, back, forward) {
  schedulePartWrapper.find('div.resizer.'+ this.schedule.cssLeftOrTop())[back ? 'show' : 'hide']();
  schedulePartWrapper.find('div.resizer.' + this.schedule.cssRightOrBottom())[forward ? 'show' : 'hide']();
};

CwicScheduleViewItem.prototype.showContinues = function(schedulePartWrapper, back, forward) {
  schedulePartWrapper.find('div.continue.' + this.schedule.cssLeftOrTop())[back ? 'show' : 'hide']();
  schedulePartWrapper.find('div.continue.' + this.schedule.cssRightOrBottom())[forward ? 'show' : 'hide']();
};

CwicScheduleViewItem.prototype.getMomentsBlock = function() {
  var currSlackBegin, currBegin, currEnd, currSlackEnd;
  if(this.conceptMode) {
    currBegin = this.getConceptBegin();
    currSlackBegin = this.getConceptSlackBegin();

    currEnd = this.getConceptEnd();
    currSlackEnd = this.getConceptSlackEnd();
  } else {
    currBegin = this.begin;
    currSlackBegin = this.getSlackBegin();

    currEnd = this.end;
    currSlackEnd = this.getSlackEnd();
  }

  return {
    slackBegin: currSlackBegin,
    begin: currBegin,
    end: currEnd,
    slackEnd: currSlackEnd
  };
};

CwicScheduleViewItem.prototype.setScheduleItemDimensions = function(domObj, momentBlock) {
  var domObjWrapper = $(domObj);
  var domObj = domObjWrapper.find('div.schedule-item');
  // The wrapper will have the full slack space as dimensions
  domObjWrapper.css(this.schedule.cssLeftOrTop(), this.schedule.timeToPercentage(momentBlock.slackBegin) + '%');
  domObjWrapper.css(this.schedule.cssWidthOrHeight(), this.schedule.timePercentageSpan(momentBlock.slackBegin, momentBlock.slackEnd) + '%');
  domObj.css(this.schedule.cssLeftOrTop(), this.relativeSlackPercentage(momentBlock.slackBegin, momentBlock.begin, momentBlock.slackEnd) + '%');
  domObj.css(this.schedule.cssWidthOrHeight(), this.relativeSlackWidthPercentage(momentBlock.slackBegin, momentBlock.begin, momentBlock.end, momentBlock.slackEnd) + '%');
};

CwicScheduleViewItem.prototype.render = function(concept) {
  var _this = this;
  this.conceptMode = concept || false;
  var momentBlock = this.getMomentsBlock();

  var domObjectsAlreadyPresent = APP.util.arrayKeys(this.domObjects);

  if(!this.checkEndAfterBegin(concept)) {
    // remove all items
    this.removeFromDom();
    return;
  }

  // Also accept an item that stops on 0:00 the following day
  var parts = (this.schedule.options.zoom == 'day') ? this.schedule.getDatesBetween(momentBlock.slackBegin, momentBlock.slackEnd) : this.schedule.getWeeksBetween(momentBlock.slackBegin, momentBlock.slackEnd);
  for(var parti in parts) {
    var part = parts[parti];
    var partBegin = moment(part).startOf(this.schedule.options.zoom);
    var partEnd = moment(part).endOf(this.schedule.options.zoom);

    // The momentJS min and max functions work like a lowerbound and upperboud limit function and not really like min and max
    var partMomentBlock = {
      slackBegin: momentBlock.slackBegin.min(partBegin),
      begin: momentBlock.begin.min(partBegin),
      end: momentBlock.end.max(partEnd),
      slackEnd: momentBlock.slackEnd.max(partEnd)
    };

    var partBeginContainerId = this.schedule.getContainerId(partBegin);

    var schedulePartWrapper;

    if($.inArray(partBeginContainerId, domObjectsAlreadyPresent) > -1) {
      // Dom object already exists for this container! lets make use of it
      schedulePartWrapper = $(this.domObjects[partBeginContainerId]);
      // If it was previously flagged as a removal candidate, unflag it and show it again.
      schedulePartWrapper.show().removeClass('locked-removal-candidate');
      this.setScheduleItemDimensions(schedulePartWrapper, partMomentBlock);
      // Remove this item from the array of existing dom objects that are not used.
      domObjectsAlreadyPresent = $.grep(domObjectsAlreadyPresent, function(value) {
        return value != partBeginContainerId;
      });
    } else {
      var container = this.schedule.getZoomContainer(part, this.scheduleEntity.entity_id);

      // Check if the container is not present, this means not in current view, so skip
      if(container.length === 0) {
        continue;
      }
      // Create a new schedule item for the current container
      schedulePartWrapper = this.renderPart(container, partMomentBlock);
      this.domObjects[partBeginContainerId] = schedulePartWrapper.get(0);
    }

    schedulePartWrapper.find('div.plus')[this.item_id == null ? 'show' : 'hide']();
    schedulePartWrapper.find('div.ok')[this.item_id !== null && this.conceptDiffersWithOriginal() ? 'show' : 'hide']();

    if(momentBlock.begin.isAfter(partBegin) && momentBlock.begin.isBefore(partEnd) && momentBlock.end.isAfter(partBegin) && momentBlock.end.isBefore(partEnd)) {
      this.showResizers(schedulePartWrapper, true, true);
      this.showContinues(schedulePartWrapper, false, false);
    } else if(momentBlock.begin.isAfter(partBegin) && momentBlock.begin.isBefore(partEnd)) {
      // ScheduleItem begin is in current part
      this.showContinues(schedulePartWrapper, false, true);
      this.showResizers(schedulePartWrapper, true, false);
    } else if(momentBlock.end.isAfter(partBegin) && momentBlock.end.isBefore(partEnd)) {
      // ScheduleItem end is in current part
      this.showContinues(schedulePartWrapper, true, false);
      this.showResizers(schedulePartWrapper, false, true);
    } else {
      // All overlapped parts
      this.showResizers(schedulePartWrapper, false, false);
      this.showContinues(schedulePartWrapper, true, true);
    }
  }

  this.checkGlowState();

  // Lets see if we still need to delete unused DOM objects from the previous render
  $.each(domObjectsAlreadyPresent, function(index, value) {
    var item = $(_this.domObjects[value]);
    // If this item is locked, it cannot be removed (could be needed for drag events)
    if(item.hasClass('locked')) {
      item.addClass('locked-removal-candidate').hide();
    } else {
      item.remove();
      delete _this.domObjects[value];
    }
  });
};

CwicScheduleViewItem.prototype.cleanUpLockedDomItems = function() {
  var _this = this;
  $.each(this.domObjects, function(index, item){
    item = $(this);
    if(item.hasClass('locked-removal-candidate')) {
      item.remove();
      delete _this.domObjects[index];
    } else {
      item.removeClass('locked');
    }

  });
};

CwicScheduleViewItem.prototype.bindDragAndResizeControls = function() {
  var _this = this;
  var context = {
    reset: function() {
      this.side = null;
      this.startPointedScheduleItem = null;
      this.pointerDown = false;
      this.pointerDownPoint = null;
      this.container = null;
      this.lastDragMoment = null;
      return this;
    }
  }.reset();

  var scheduleBody = this.schedule.scheduleContainer.find('div.schedule-body');
  scheduleBody.on('pointerdown.dragresize', 'div.schedule-item', function(e) { _this.dragAndResizeDown(e, context); });
  scheduleBody.on('pointermove.dragresize', function(e) { _this.dragAndResizeMove(e, context); });
  scheduleBody.on('pointerup.dragresize', function(e) { _this.dragAndResizeUp(e, context); });
  $(document).on('keyup.cancelDragOrResize', function(e) { _this.dragAndResizeEsc(e, context);});
};

CwicScheduleViewItem.prototype.unbindDragAndResizeControls = function() {
  var scheduleBody = this.schedule.scheduleContainer.find('div.schedule-body');
  scheduleBody.off('pointerdown.dragresize');
  scheduleBody.off('pointermove.dragresize');
  scheduleBody.off('pointerup.dragresize');
  $(document).off('keyup.cancelDragOrResize');
};


CwicScheduleViewItem.prototype.dragAndResizeEsc = function(event, context) {
  if (event.keyCode == 27) { // ESC
    this.schedule.stopEditMode(false);
  } else if(event.keyCode == 13) { // ENTER
    this.schedule.stopEditMode(true);
  }
};

CwicScheduleViewItem.prototype.dragAndResizeDown = function(event, context) {
  event.preventDefault();
  context.pointerDown = true;

  // store startPoint
  context.pointerDownPoint = { pageX: event.originalEvent.pageX, pageY: event.originalEvent.pageY };

  // Get the dom element which is pointed
  pointed = this.schedule.getElementForPoint(event);
  context.startPointedScheduleItem = pointed.closest('div.schedule-item-wrapper');

  // Assert if this drag is not started on the current schedule item
  var startPointedScheduleItemId = context.startPointedScheduleItem.find('.schedule-item').data('scheduleItemID');
  if(this.item_id != null && this.item_id != parseInt(startPointedScheduleItemId, 10)) {
    context.reset();
    return;
  }

  // Make sure the pointed schedule item wont be removed (to make touch interaction function properly)
  context.startPointedScheduleItem.addClass('locked');

  context.container = this.schedule.getContainerForPoint(event);
  // Check if drag started on resize handle
  var handle = pointed.closest('div.resizer');
  if(handle.length !== 0) { // resize mode
    context.side = (handle.hasClass('left') || handle.hasClass('top') ? 'backwards' : 'forwards');
  } else { // drag mode
    var rel = this.schedule.getPointerRel(event, context.container);
    context.lastDragMoment = this.schedule.nearestMomentPoint(rel, context.container);
  }
};

CwicScheduleViewItem.prototype.dragAndResizeMove = function(event, context) {
  if(context.pointerDown) {
    event.preventDefault();

    // Are we in a different row or column?
    // We cannot use the event.target here because with touch events, this is not updated upon a move event.
    // We need to get this information based on the event coordinates.
    var newRow = schedule.getContainerForPoint(event);
    if(newRow.length > 0) {
      context.container = newRow;
    }

    // Get the event information from the current scheduleItemDom
    var pointed = this.schedule.getElementForPoint(event);
    var rel = this.schedule.getPointerRel(event, context.container);
    var newMoment = this.schedule.nearestMomentPoint(rel, context.container);

    var newDoms;
    if(context.side === null) { // drag item mode
      // correct position in schedule-item, because we want to know the begin position of this item.
      // rel can be negative if item is dragged to previous day.
      if(!newMoment.isSame(context.lastDragMoment)) {
        var dragMomentDiffMS = moment(newMoment).diff(context.lastDragMoment);
        newDoms = this.applyTimeDiffConcept(dragMomentDiffMS);
        context.lastDragMoment = newMoment;
      }
    } else { // resize mode
      newDoms = this.resizeConcept(context.side, newMoment);
    }
  }
};

CwicScheduleViewItem.prototype.checkGlowState = function() {
  var errorGlow = this.conceptCollidesWithOthers();
  var slackGlow = this.conceptSlackCollidesWithOthers() && !errorGlow;
  this.applyGlow('slack', slackGlow);
  this.applyGlow('error', errorGlow);
};

CwicScheduleViewItem.prototype.dragAndResizeUp = function(event, context) {
  if(context.pointerDown) {
    context.pointerDown = false;
    // Check if this drag should perfom the click action (small or no movement)
    var currentPoint = this.schedule.getPointerRel(event, context.container);
    // Euclidean distance
    if(Math.sqrt(Math.pow(event.originalEvent.pageX - context.pointerDownPoint.pageX, 2) + Math.pow(event.originalEvent.pageY - context.pointerDownPoint.pageY, 2)) < 10) {
      this.schedule.stopEditMode(true);
    }

    if(this.conceptCollidesWithOthers() || !this.checkEndAfterBegin(true)) {
      this.resetConcept();
    }

    this.cleanUpLockedDomItems();

    // Reset drag vars
    context.reset();
  }
};

CwicScheduleViewItem.prototype.dragAndResizeCancel = function(event, context) {
  context.pointerDown = false;
  this.resetConcept();
  context.reset();
};
