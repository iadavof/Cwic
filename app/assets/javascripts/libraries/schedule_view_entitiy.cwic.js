function CwicScheduleViewEntity(_schedule, _schedule_entity_type_id, _schedule_entity_id) {
  this.schedule = _schedule;
  this.scheduleContainer = _schedule.scheduleContainer;
  this.entity_type_id = _schedule_entity_type_id || null;
  this.entity_id = _schedule_entity_id || null;

  this.default_slack_before = 0;
  this.default_slack_after = 0;

  this.color = '#fff';
  this.name = '';
  this.icon_src = '';

  this.selected = false;

  this.scheduleItems = {};

  this.showCaseButtonDOM = null;
}

CwicScheduleViewEntity.prototype.createNewScheduleItem = function(JSON) {
  var newItem = new CwicScheduleViewItem(this.schedule, this, JSON ? JSON.id : null);

  // Set default slack
  newItem.setSlack(this.default_slack_before, this.default_slack_after);

  // Only add a pointer to this new schedule item if it has an id
  if(newItem.item_id !== null) {
    this.scheduleItems[newItem.item_id] = newItem;
  }

  if(JSON) {
    newItem.parseFromJSON(JSON);
  }

  return newItem;
};

CwicScheduleViewEntity.prototype.loadNewScheduleItemsFromJSON = function(itemsJSON) {
  var entity = this;
  // Clear the previous set
  this.clearScheduleItems();
  // Add the new ones
  $.each(itemsJSON, function(itemid, item) {
    entity.createNewScheduleItem(item);
  });
};

CwicScheduleViewEntity.prototype.checkUnhideNonBlockingItems = function() {
  if(this.scheduleItems != null) {
    $.each(this.scheduleItems, function(itemId, item) {
      if(item.hidden) {
        // If item collides with blocking item, we do not need it anymore, remove it
        if(item.conceptCollidesWithOthers()) {
          item.destroy();
        } else { // Show item again
          item.setVisibilityDom(true);
        }
      }
    });
  }
};

CwicScheduleViewEntity.prototype.clearScheduleItems = function() {
  for(schiId in this.scheduleItems) {
    this.scheduleItems[schiId].removeFromDom();
    delete this.scheduleItems[schiId];
  }
  this.scheduleItems = {};
};

CwicScheduleViewEntity.prototype.getScheduleItemById = function(schiId) {
  return this.scheduleItems[schiId];
};

CwicScheduleViewEntity.prototype.destroyScheduleItem = function(schiId) {
  this.scheduleItems[schiId].removeFromDom();
  delete this.scheduleItems[schiId];
};

CwicScheduleViewEntity.prototype.rerenderScheduleItems = function() {
  for(var schii in this.scheduleItems) {
    this.scheduleItems[schii].rerender();
  }
};

CwicScheduleViewEntity.prototype.renderScheduleItems = function() {
  for(var schii in this.scheduleItems) {
    this.scheduleItems[schii].render();
  }
};

CwicScheduleViewEntity.prototype.setEntityContainerHeight = function(nrEntities) {
  // Adjust height of object rows based on the number of objects that are being selected.
  if(nrEntities != null) {
    if(nrEntities == 1) {
      this.scheduleContainer.find('.schedule-object-item-parts').css('height', '60px');
    } else if(nrEntities == 2) {
      this.scheduleContainer.find('.schedule-object-item-parts').css('height', '60px');
    } else {
      this.scheduleContainer.find('.schedule-object-item-parts').css('height', '30px');
      this.scheduleContainer.find('.left-axis .left-axis-row:not(.today)').height(this.scheduleContainer.find('.row:not(.today)').outerHeight());
      this.scheduleContainer.find('.left-axis .left-axis-row.today').height(this.scheduleContainer.find('.row.today').outerHeight());
    }
  }
};

CwicScheduleViewEntity.prototype.renderScheduleEntityContainer = function(timeparts) {
  var newSchObjItemParts = this.schedule.getTemplateClone('scheduleEntityItemPartsTemplate');
  newSchObjItemParts.addClass('scheduleEntity_' + this.entity_id);
  newSchObjItemParts.data('scheduleEntityID', this.entity_id);
  newSchObjItemParts.find('p.name').text(this.name);
  timeparts.append(newSchObjItemParts);
};

CwicScheduleViewEntity.prototype.setSelected = function(sel) {
  this.selected = sel;
  if(this.showCaseButtonDOM) {
    if(sel) {
      this.showCaseButtonDOM.addClass('active');
    } else {
      this.showCaseButtonDOM.removeClass('active');
    }
  }
};

CwicScheduleViewEntity.prototype.getSelected = function() {
  return this.selected;
};

CwicScheduleViewEntity.prototype.parseFromJSON = function(json) {
  this.color = json.color;
  this.name = json.name;
  this.icon_src = json.icon;

  this.default_slack_before = json.default_slack_before;
  this.default_slack_after = json.default_slack_after;
};


CwicScheduleViewEntity.prototype.renderEntityShowcaseButton = function(container) {
  this.showCaseButtonDOM = this.schedule.getTemplateClone('entityButtonTemplate');
  this.showCaseButtonDOM.attr('id', 'entity_'+ this.entity_id).css('border-color', this.color);
  this.showCaseButtonDOM.find('.entity-name').text(this.name);
  this.showCaseButtonDOM.find('img.entity-icon').attr('src', this.icon_src);
  container.append(this.showCaseButtonDOM);

  return this.showCaseButtonDOM;
};
