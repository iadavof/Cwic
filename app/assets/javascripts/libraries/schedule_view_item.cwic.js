function CwicScheduleViewItem(_schedule, _scheduleEntity, _item_id) {
  this.schedule = _schedule;
  this.scheduleContainer = _schedule.scheduleContainer;
  this.scheduleEntity = _scheduleEntity || null;
  this.item_id = _item_id || null;

  this.hidden = false;
  this.focused = false;

  this.begin = null; // momentjs object
  this.end = null; // momentjs object

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

  this.domObjects = [];
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

CwicScheduleViewItem.prototype.applyErrorGlow = function() {
  var domObjectsSItems = $(this.domObjects).find('div.schedule-item');
  // Remove possible slack glow
  domObjectsSItems.removeClass('slack-glow');
  domObjectsSItems.addClass('error-glow');
};

CwicScheduleViewItem.prototype.applySlackGlow = function() {
  $(this.domObjects).find('div.schedule-item').addClass('slack-glow');
};

CwicScheduleViewItem.prototype.relativeSlackPercentage = function(slackBegin, itemBegin, slackEnd) {
  var totalWrapperTimeLength = slackEnd.diff(slackBegin);
  var relativeSlackPercentage = 0;
  if(!slackBegin.isSame(itemBegin)) {
    // We need to show start slack here
    relativeSlackPercentage = (itemBegin.diff(slackBegin) / totalWrapperTimeLength) * 100;
  }
  return relativeSlackPercentage;
};

CwicScheduleViewItem.prototype.relativeSlackWidthPercentage = function(slackBegin, itemBegin, itemEnd, slackEnd) {
  var totalWrapperTimeLength = slackEnd.diff(slackBegin);
  var itemTimeLength = itemEnd.diff(itemBegin);
  return itemTimeLength / totalWrapperTimeLength * 100;
};

CwicScheduleViewItem.prototype.renderPart = function(jschobj, beginSlackMoment, beginMoment, endMoment, endSlackMoment) {
  var newScheduleItemWrapper = this.schedule.getTemplateClone('scheduleItemTemplate');
  var newScheduleItem = newScheduleItemWrapper.find('div.schedule-item');

  if(this.schedule.options.view == 'horizontalCalendar') {
    // The wrapper will have the full slack space as dimensions
    newScheduleItemWrapper.css('left', this.schedule.timeToPercentage(beginSlackMoment) + '%');
    newScheduleItemWrapper.css('width', this.schedule.timePercentageSpan(beginSlackMoment, endSlackMoment) + '%');
    newScheduleItem.css('left', this.relativeSlackPercentage(beginSlackMoment, beginMoment, endSlackMoment) + '%');
    newScheduleItem.css('width', this.relativeSlackWidthPercentage(beginSlackMoment, beginMoment, endMoment, endSlackMoment) + '%');
  } else if(this.schedule.options.view == 'verticalCalendar') {
    newScheduleItemWrapper.css('top', this.schedule.timeToPercentage(beginSlackMoment) + '%');
    newScheduleItemWrapper.css('height', this.schedule.timePercentageSpan(beginSlackMoment, endSlackMoment) + '%');
    newScheduleItem.css('top', this.relativeSlackPercentage(beginSlackMoment, beginMoment, endSlackMoment) + '%');
    newScheduleItem.css('height', this.relativeSlackWidthPercentage(beginSlackMoment, beginMoment, endMoment, endSlackMoment) + '%');
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

  if(!this.blocking) {
    newScheduleItemWrapper.addClass('hidden');
  }

  if(this.status !== null) {
    newScheduleItem.find('div.status').attr('title', this.status.name).css({ backgroundColor: this.status.bg_color, color: this.status.text_color, borderColor: this.status.text_color }).find('span').text(this.status.name.substring(0,1));
  } else {
    newScheduleItem.find('div.status').attr('title', jsLang.schedule_view.status_unknown);
  }

  // Add scheduleItem ID to DOM object
  newScheduleItem.data('scheduleItemID', this.item_id);

  newScheduleItem.attr('title', this.description);
  jschobj.append(newScheduleItemWrapper);

  var schWidth = newScheduleItem.width();
  var schHeight = newScheduleItem.height();
  var newScheduleItemText = newScheduleItem.find('p.item-text');
  newScheduleItemText.text(this.description);

  if(schWidth > 40 && this.item_id !== null) {
    newScheduleItem.find('div.status').show();
  }

  return newScheduleItemWrapper;
};

CwicScheduleViewItem.prototype.acceptConcept = function() {
  this.undoBegin = this.begin;
  this.undoEnd = this.end;

  this.begin = this.getConceptBegin();
  this.end = this.getConceptEnd();

  this.scheduleEntity.checkUnhideNonBlockingItems();

  this.rerender();
};

CwicScheduleViewItem.prototype.undoAcceptConcept = function() {
  if(this.undoBegin !== null) {
    this.begin = this.undoBegin;
  }
  if(this.undoEnd !== null) {
    this.end = this.undoEnd;
  }

  this.rerender();
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
};

CwicScheduleViewItem.prototype.applyTimeDiffConcept = function(milliseconds) {
  this.conceptBegin = moment(this.begin).add('ms', milliseconds);
  this.conceptEnd = moment(this.end).add('ms', milliseconds);
  this.rerender(true);
};

CwicScheduleViewItem.prototype.resizeConcept = function(side, newMoment) {
  if(side == 'backwards') {
    if(newMoment.isSame(this.getConceptBegin())) {
      // Nothing changed, move on
      return;
    }
    this.conceptBegin = moment(newMoment);
  } else {
    if(newMoment.isSame(this.getConceptEnd())) {
      // Nothing changed, move on
      return;
    }
    this.conceptEnd = moment(newMoment);
  }
  this.rerender(true);
};

CwicScheduleViewItem.prototype.conceptDiffersWithOriginal = function() {
  return !this.begin.isSame(this.getConceptBegin()) || !this.end.isSame(this.getConceptEnd());
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
  $(this.domObjects).remove();
  this.domObjects = [];
};

CwicScheduleViewItem.prototype.setVisibilityDom = function(visible) {
  this.hidden = !visible;
  (visible) ? $(this.domObjects).show() : $(this.domObjects).hide();
};

CwicScheduleViewItem.prototype.applyFocus = function() {
  this.focused = true;
  var domOs = $(this.domObjects);
  domOs.addClass('focused');
  domOs.find('.resizer.left').css('cursor', 'w-resize');
  domOs.find('.resizer.right').css('cursor', 'e-resize');

  this.schedule.blurStateOnOtherScheduleItems(true);
};

CwicScheduleViewItem.prototype.removeFocus = function() {
  this.focused = false;
  var domOs = $(this.domObjects);
  domOs.removeClass('focused');
  domOs.find('.resizer.left').css('cursor', 'auto');
  domOs.find('.resizer.right').css('cursor', 'auto');

  this.schedule.blurStateOnOtherScheduleItems(false);
};

CwicScheduleViewItem.prototype.rerender = function(concept) {
  this.removeFromDom();
  this.render(concept);
};

CwicScheduleViewItem.prototype.addResizers = function(schedulePartWrapper, back, forward) {
  if(this.schedule.options.view == 'horizontalCalendar') {
    back ? schedulePartWrapper.find('div.resizer.left').show() : schedulePartWrapper.find('div.resizer.left').hide();
    forward ? schedulePartWrapper.find('div.resizer.right').show() : schedulePartWrapper.find('div.resizer.right').hide();
  } else if (this.schedule.options.view == 'verticalCalendar') {
    back ? schedulePartWrapper.find('div.resizer.top').show() : schedulePartWrapper.find('div.resizer.top').hide();
    forward ? schedulePartWrapper.find('div.resizer.bottom').show() : schedulePartWrapper.find('div.resizer.bottom').hide();
  }
};

CwicScheduleViewItem.prototype.showContinues = function(schedulePartWrapper, back, forward) {
  if(this.schedule.options.view == 'horizontalCalendar') {
    back ? schedulePartWrapper.find('div.continue.left').show() : schedulePartWrapper.find('div.continue.left').hide();
    forward ? schedulePartWrapper.find('div.continue.right').show() : schedulePartWrapper.find('div.continue.right').hide();
  } else if (this.schedule.options.view == 'verticalCalendar') {
    back ? schedulePartWrapper.find('div.continue.top').show() : schedulePartWrapper.find('div.continue.top').hide();
    forward ? schedulePartWrapper.find('div.continue.bottom').show() : schedulePartWrapper.find('div.continue.bottom').hide();
  }
};

CwicScheduleViewItem.prototype.render = function(concept) {
  this.conceptMode = concept || false;
  var currBegin, currSlackBegin, currEnd, currSlackEnd;
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

  if(!this.checkEndAfterBegin(concept)) {
    return;
  }

  // Also accept an item that stops on 0:00 the following day
  var parts = (this.schedule.options.zoom == 'day') ? this.schedule.getDatesBetween(currSlackBegin, currSlackEnd) : this.schedule.getWeeksBetween(currSlackBegin, currSlackEnd);
  for(var parti in parts) {
    var part = parts[parti];
    var partBegin = moment(part).startOf(this.schedule.options.zoom);
    var partEnd = moment(part).endOf(this.schedule.options.zoom);
    var container = this.schedule.getZoomContainer(part, this.scheduleEntity.entity_id);

    // Check if the container is not present, this means not in current view, so skip
    if(container.length === 0) {
      continue;
    }

    // The momentJS min and max functions work like a lowerbound and upperboud limit function and not really like min and max
    var schedulePartWrapper = this.renderPart(container, currSlackBegin.min(partBegin), currBegin.min(partBegin), currEnd.max(partEnd), currSlackEnd.max(partEnd));

    if(currBegin.isAfter(partBegin) && currBegin.isBefore(partEnd) && currEnd.isAfter(partBegin) && currEnd.isBefore(partEnd)) {
      this.addResizers(schedulePartWrapper, true, true);
    } else if(currBegin.isAfter(partBegin) && currBegin.isBefore(partEnd)) {
      // ScheduleItem begin is in current part
      this.showContinues(schedulePartWrapper, false, true);
      this.addResizers(schedulePartWrapper, true, false);
    } else if(currEnd.isAfter(partBegin) && currEnd.isBefore(partEnd)) {
      // ScheduleItem end is in current part
      this.showContinues(schedulePartWrapper, true, false);
      this.addResizers(schedulePartWrapper, false, true);
    } else {
      // All overlapped parts
      this.showContinues(schedulePartWrapper, true, true);
    }

    if(this.focused) {
      schedulePartWrapper.addClass('focused');
    }

    this.domObjects.push(schedulePartWrapper.get(0));
  }
};

CwicScheduleViewItem.prototype.bindDragAndResizeControls = function() {
  var _this = this;
  var context = {
    reset: function() {
      this.side = null;
      this.pointerDown = false;
      this.containerTP = null;
      this.dragStartMoment = null;
      this.lastDragMoment = null;
      return this;
    }
  }.reset();

  this.schedule.scheduleContainer.on('mousedown.dragresize', 'div.schedule-item-wrapper.focused div.schedule-item', function(e) { _this.dragAndResizeDown(e, context); });
  this.schedule.scheduleContainer.on('mousemove.dragresize', function(e) { _this.dragAndResizeMove(e, context); });
  $('html').on('mouseup.dragresize', function(e) { _this.dragAndResizeUp(e, context); });
  $('html').on('mousecancel.dragresize', function(e) { _this.dragAndResizeCancel(e, context); });
  $(document).on('keyup.cancelDragOrResize', function(e) {_this.dragAndResizeEsc(e, context);});
};

CwicScheduleViewItem.prototype.unbindDragAndResizeControls = function() {
  this.schedule.scheduleContainer.off('mousedown.dragresize');
  this.schedule.scheduleContainer.off('mousemove.dragresize');
  $('html').off('mouseup.dragresize');
  $('html').off('mousecancel.dragresize');
  $(document).off('keyup.cancelDragOrResize');
};


CwicScheduleViewItem.prototype.dragAndResizeEsc = function(event, context) {
  if (event.keyCode == 27) {
    if(this.conceptDiffersWithOriginal()) {
      this.resetConcept();
      context.reset();
    } else {
      this.schedule.stopEditMode();
    }
  }
};

CwicScheduleViewItem.prototype.dragAndResizeDown = function(event, context) {
  context.pointerDown = true;
  var scheduleItemClickedDom = $(event.target).closest('div.schedule-item');
  context.containerTP = scheduleItemClickedDom.parents('div.schedule-object-item-parts');

  // Check if drag started on resize handle
  var handle = $(event.target).closest('div.resizer');
  if(handle.length !== 0) { // resize mode
    context.side = (handle.hasClass('left') || handle.hasClass('top') ? 'backwards' : 'forwards');
  } else { // drag mode
    var rel = this.schedule.getPointerRel(event, context.containerTP);
    context.dragStartMoment = this.schedule.nearestMomentPoint(rel, context.containerTP);
    context.lastDragMoment = context.dragStartMoment;
  }
};

CwicScheduleViewItem.prototype.dragAndResizeMove = function(event, context) {
  if(context.pointerDown) {
    var scheduleItemClickedDom = $(event.target);
    var newRow = scheduleItemClickedDom.closest('div.schedule-object-item-parts');
    if(newRow.length > 0) {
      context.containerTP = newRow;
    }
    var rel = this.schedule.getPointerRel(event, context.containerTP);
    var newMoment = this.schedule.nearestMomentPoint(rel, context.containerTP);
    if(context.side === null) { // drag item mode
      // correct position in schedule-item, because we want to know the begin position of this item.
      // rel can be negative if item is dragged to previous day.
      if(!newMoment.isSame(context.lastDragMoment)) {
        var dragMomentDiffMS = moment(newMoment).diff(context.dragStartMoment);
        this.applyTimeDiffConcept(dragMomentDiffMS);
        context.lastDragMoment = newMoment;
      }
    } else { // resize mode
      // rel can be negative if item is dragged to previous day.
      this.resizeConcept(context.side, newMoment);
    }

    if(this.conceptSlackCollidesWithOthers()) {
      this.applySlackGlow();
    }

    // Glow red if cannot be placed here
    if(this.conceptCollidesWithOthers()) {
      this.applyErrorGlow();
    }
  }
};

CwicScheduleViewItem.prototype.dragAndResizeUp = function(event, context) {
  context.pointerDown = false;
  if(!this.conceptCollidesWithOthers() && this.checkEndAfterBegin(true) && this.conceptDiffersWithOriginal()) {
    this.acceptConcept();
    this.schedule.patchScheduleItemBackend(this, true);
  } else {
    this.resetConcept();
  }
  // Reset drag vars
  context.reset();
};

CwicScheduleViewItem.prototype.dragAndResizeCancel = function(event, context) {
  context.pointerDown = false;
  this.resetConcept();
  context.reset();
};
