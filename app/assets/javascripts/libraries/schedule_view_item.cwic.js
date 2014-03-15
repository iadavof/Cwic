function CwicScheduleViewItem(_schedule, _scheduleEntity, _item_id) {
  this.schedule = _schedule;
  this.scheduleContainer = _schedule.scheduleContainer;
  this.scheduleEntity = _scheduleEntity || null;
  this.item_id = _item_id || null;

  this.hidden = false;

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
                      name: newItem.status.name,
                    }
  }
}

CwicScheduleViewItem.prototype.railsDataExport = function() {
  return {reservation: {
    reservation_id: this.item_id,
    begins_at: this.begin.format('YYYY-MM-DD HH:mm'),
    ends_at: this.end.format('YYYY-MM-DD HH:mm'),
  }};
}

CwicScheduleViewItem.prototype.applyErrorGlow = function() {
  $.each(this.domObjects, function(index, item) {
    var schitem = item.find('div.schedule-item')
    // Remove possible slack glow
    schitem.removeClass('slack-glow');
    schitem.addClass('error-glow');
  });
}

CwicScheduleViewItem.prototype.applySlackGlow = function() {
  $.each(this.domObjects, function(index, item) {
    item.find('div.schedule-item').addClass('slack-glow');
  });
}

CwicScheduleViewItem.prototype.relativeSlackPercentage = function(slackBegin, itemBegin, slackEnd) {
  var totalWrapperTimeLength = slackEnd.diff(slackBegin);
  var relativeSlackPercentage = 0;
  if(!slackBegin.isSame(itemBegin)) {
    // We need to show start slack here
    relativeSlackPercentage = (itemBegin.diff(slackBegin) / totalWrapperTimeLength) * 100;
  }
  return relativeSlackPercentage;
}

CwicScheduleViewItem.prototype.relativeSlackWidthPercentage = function(slackBegin, itemBegin, itemEnd, slackEnd) {
  var totalWrapperTimeLength = slackEnd.diff(slackBegin);
  var itemTimeLength = itemEnd.diff(itemBegin);
  return itemTimeLength / totalWrapperTimeLength * 100;
}

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

  if(this.bg_color != null) {
    newScheduleItem.css('background-color', this.bg_color);
  } else {
    newScheduleItem.addClass('concept');
  }
  if(this.text_color != null) {
    newScheduleItem.css('color', this.text_color);
    newScheduleItem.find('a').css('color', this.text_color);
  }

  if(!this.blocking) {
    newScheduleItemWrapper.addClass('hidden');
  }

  if(this.status != null) {
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

  if(schWidth > this.schedule.options.min_description_width) {
    newScheduleItemText.text(this.description);
  }
  if(schWidth > 50 && this.item_id != null) {
    newScheduleItem.find('div.status').show();
  }

  if((this.schedule.options.view == 'horizontalCalendar' && schWidth > 30) || (this.schedule.options.view == 'verticalCalendar' && schHeight > 30)) {
    if(this.item_id != null) {
      // not new item, so open tooltip control
      newScheduleItem.find('a.open-toolbar').show();
    }
  } else {
    // let the open toolbar link be the whole schedule item, remove the icon
    if(this.item_id != null) {
      newScheduleItem.find('a.open-toolbar').show().html('').css({ width: '100%', height: '100%', left: 0, top: 0, margin: 0 });
    }
    newScheduleItemText.hide();
  }

  return newScheduleItemWrapper;
}

CwicScheduleViewItem.prototype.acceptConcept = function() {
  this.undoBegin = this.begin;
  this.undoEnd = this.end;

  this.begin = this.getConceptBegin();
  this.end = this.getConceptEnd();

  this.scheduleEntity.checkUnhideNonBlockingItems();

  this.rerender();
}

CwicScheduleViewItem.prototype.undoAcceptConcept = function() {
  if(this.undoBegin != null) {
    this.begin = this.undoBegin;
  }
  if(this.undoEnd != null) {
    this.end = this.undoEnd;
  }

  this.rerender();
}

CwicScheduleViewItem.prototype.destroy = function() {
  this.removeFromDom();
  this.scheduleEntity.destroyScheduleItem(his.entity_id);
}

CwicScheduleViewItem.prototype.resetConcept = function() {
  this.conceptBegin = null;
  this.conceptEnd = null;

  this.scheduleEntity.checkUnhideNonBlockingItems();

  this.rerender(); // Rerender in normal mode
}

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
}

CwicScheduleViewItem.prototype.applyTimeDiffConcept = function(milliseconds) {
  this.conceptBegin = moment(this.begin).add('ms', milliseconds);
  this.conceptEnd = moment(this.end).add('ms', milliseconds);
  this.rerender(true);
}

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
}

CwicScheduleViewItem.prototype.conceptDiffersWithOriginal = function() {
  return !this.begin.isSame(this.getConceptBegin()) || !this.end.isSame(this.getConceptEnd());
}

CwicScheduleViewItem.prototype.checkEndAfterBegin = function(concept) {
  if(concept) {
    var currBegin = this.getConceptBegin();
    var currEnd = this.getConceptEnd();
    return currBegin.isBefore(currEnd);
  } else {
    var currBegin = this.begin;
    var currEnd = this.end;
  }
  if(currBegin == null || currEnd == null) {
    return false;
  }
  return this.begin.isBefore(this.end);
}

CwicScheduleViewItem.prototype.getConceptBegin = function() {
  return moment((this.conceptBegin != null) ? this.conceptBegin : this.begin);
}

CwicScheduleViewItem.prototype.getConceptEnd = function() {
  return moment((this.conceptEnd != null) ? this.conceptEnd : this.end);
}

CwicScheduleViewItem.prototype.getConceptSlackBegin = function() {
  return moment(this.getConceptBegin()).subtract('minutes', this.slack_before);
}

CwicScheduleViewItem.prototype.getConceptSlackEnd = function() {
  return moment(this.getConceptEnd()).add('minutes', this.slack_after);
}

CwicScheduleViewItem.prototype.getSlackBegin = function() {
  return moment(this.begin).subtract('minutes', this.slack_before);
}

CwicScheduleViewItem.prototype.getSlackEnd = function() {
  return moment(this.end).add('minutes', this.slack_after);
}

// This function has to be extended to check collision with first events just out of the current calendar scope
CwicScheduleViewItem.prototype.conceptCollidesWithOthers = function(slack) {
  var _this = this;

  var curConceptBegin = slack ? this.getConceptSlackBegin() : this.getConceptBegin();
  var curConceptEnd = slack ? this.getConceptSlackEnd() : this.getConceptEnd();
  var otherItemsForObject = this.scheduleEntity.scheduleItems;
  var collision = false;

  if(otherItemsForObject != null) {
    $.each(otherItemsForObject, function(itemId, item) {
      // exclude self
      if(_this.item_id != null && itemId == _this.item_id) {
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
}

CwicScheduleViewItem.prototype.conceptSlackCollidesWithOthers = function() {
  return this.conceptCollidesWithOthers(true);
}

CwicScheduleViewItem.prototype.conceptCollidesWith = function(moment) {
  var curConceptBegin = this.getConceptBegin();
  var curConceptEnd = this.getConceptEnd();

  return ((curConceptBegin.isBefore(moment) || curConceptBegin.isSame(moment)) && curConceptEnd.isAfter(moment));
}

CwicScheduleViewItem.prototype.removeFromDom = function() {
  for(var nr in this.domObjects) {
    $(this.domObjects[nr]).remove();
  }
  this.domObjects = [];
}

CwicScheduleViewItem.prototype.setVisibilityDom = function(visible) {
  this.hidden = !visible;
  for(var nr in this.domObjects) {
    if(visible) {
      $(this.domObjects[nr]).show();
    } else {
      $(this.domObjects[nr]).hide();
    }
  }
}

CwicScheduleViewItem.prototype.applyFocus = function() {
  this.schedule.removeFocusFromAllScheduleItems();
  $.each(this.domObjects, function(index, item){
    $(item).addClass('open');
  });
  this.schedule.focusedScheduleItem = this;
  this.schedule.updateScheduleItemFocus();
}

CwicScheduleViewItem.prototype.rerender = function(concept) {
  this.removeFromDom();
  this.render(concept);
}

CwicScheduleViewItem.prototype.showResizers = function(schedulePartWrapper, back, forward) {
  if(this.item_id == null) {
    // We are drawing a new item (created while dragging, so we do not want to show the resize handles
    return;
  }

  if(this.schedule.options.view == 'horizontalCalendar' && schedulePartWrapper.width() > 30) {
    back ? schedulePartWrapper.find('div.resizer.left').show() : schedulePartWrapper.find('div.resizer.left').hide();
    forward ? schedulePartWrapper.find('div.resizer.right').show() : schedulePartWrapper.find('div.resizer.right').hide();
  } else if (this.schedule.options.view == 'verticalCalendar' && schedulePartWrapper.height() > 30) {
    back ? schedulePartWrapper.find('div.resizer.top').show() : schedulePartWrapper.find('div.resizer.top').hide();
    forward ? schedulePartWrapper.find('div.resizer.bottom').show() : schedulePartWrapper.find('div.resizer.bottom').hide();
  }
}

CwicScheduleViewItem.prototype.showContinues = function(schedulePartWrapper, back, forward) {
  if(this.schedule.options.view == 'horizontalCalendar') {
    back ? schedulePartWrapper.find('div.continue.left').show() : schedulePartWrapper.find('div.continue.left').hide();
    forward ? schedulePartWrapper.find('div.continue.right').show() : schedulePartWrapper.find('div.continue.right').hide();
  } else if (this.schedule.options.view == 'verticalCalendar') {
    back ? schedulePartWrapper.find('div.continue.top').show() : schedulePartWrapper.find('div.continue.top').hide();
    forward ? schedulePartWrapper.find('div.continue.bottom').show() : schedulePartWrapper.find('div.continue.bottom').hide();
  }
}

CwicScheduleViewItem.prototype.render = function(concept) {
  this.conceptMode = concept || false;
  if(this.conceptMode) {
    var currBegin = this.getConceptBegin();
    var currSlackBegin = this.getConceptSlackBegin();

    var currEnd = this.getConceptEnd();
    var currSlackEnd = this.getConceptSlackEnd();
  } else {
    var currBegin = this.begin;
    var currSlackBegin = this.getSlackBegin();

    var currEnd = this.end;
    var currSlackEnd = this.getSlackEnd();
  }

  if(!this.checkEndAfterBegin(concept)) {
    return;
  }

  // Also accept an item that stops on 0:00 the following day
  if(this.schedule.options.zoom == 'day') {
    var parts = this.schedule.getDatesBetween(currSlackBegin, currSlackEnd);
  } else {
    var parts = this.schedule.getWeeksBetween(currSlackBegin, currSlackEnd);
  }
  for(var parti in parts) {
    var part = parts[parti];
    var partBegin = moment(part).startOf(this.schedule.options.zoom);
    var partEnd = moment(part).endOf(this.schedule.options.zoom);
    var container = this.schedule.getZoomContainer(part, this.scheduleEntity.entity_id);

    // Check if the container is not present, this means not in current view, so skip
    if(container.length == 0) {
      continue;
    }

    // The momentJS min and max functions work like a lowerbound and upperboud limit function and not really like min and max
    var schedulePartWrapper = this.renderPart(container, currSlackBegin.min(partBegin), currBegin.min(partBegin), currEnd.max(partEnd), currSlackEnd.max(partEnd));

    if(currBegin.isAfter(partBegin) && currBegin.isBefore(partEnd) && currEnd.isAfter(partBegin) && currEnd.isBefore(partEnd)) {
      this.showResizers(schedulePartWrapper, true, true);
    } else if(currBegin.isAfter(partBegin) && currBegin.isBefore(partEnd)) {
      // ScheduleItem begin is in current part
      this.showContinues(schedulePartWrapper, false, true);
      this.showResizers(schedulePartWrapper, true, false);
    } else if(currEnd.isAfter(partBegin) && currEnd.isBefore(partEnd)) {
      // ScheduleItem end is in current part
      this.showContinues(schedulePartWrapper, true, false);
      this.showResizers(schedulePartWrapper, false, true);
    } else {
      // All overlapped parts
      this.showContinues(schedulePartWrapper, true, true);
    }
    this.domObjects.push(schedulePartWrapper);
  }
}
