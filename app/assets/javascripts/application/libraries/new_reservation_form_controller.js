function newReservationFormController(options) {
  this.options = $.extend({
    container: '',
    entities_controller_url: 'url to backend',
  }, options || {});

  this.formContainer = null;
  this.beginMoment = moment();
  this.endMoment = moment();
  this.entityTypeId = null;
  this.selectedEntityId = null;
  this.currentAvailableEntities = [];

  this.init();
};

newReservationFormController.prototype.init = function() {
  this.formContainer = $('#' + this.options.container);
  this.bindOnChangeActions();
  this.bindEntitySelection();
  this.bindSlackFieldValidation();
  this.performFormUpdate();
};

newReservationFormController.prototype.bindSlackFieldValidation = function() {
  var _this = this;
  var slackFields = this.formContainer.find('#reservation_slack_before, #reservation_slack_after');
  slackFields.each(function() {
    var field = $(this);
    field.on('change', function() { _this.setSlackFieldErrorState.call(field); });
  });
  this.validateSlackFields();
};

newReservationFormController.prototype.setSlackFieldErrorState = function() {
  var field = this, current = null;
  if(field.data('max-slack') != null) {
    if(field.val() !== '') {
      current = parseInt(field.val(), 10);
    } else if(field.attr('placeholder') !== '') { // The value is not set, so we have to check the placeholder value
      current = parseInt(field.attr('placeholder'), 10);
    }
    if(current != null) {
      APP.util.setFieldErrorState(field, current >= parseInt(field.data('max-slack'), 10));
      return;
    }
  }

  APP.util.setFieldErrorState(field, false);
};

newReservationFormController.prototype.bindEntitySelection = function() {
  var _this = this;
  this.getAvailableEntitiesList().on('click', 'li', function() {
    selectedLi = $(this);
    _this.selectedEntityId = selectedLi.data('entity-id');
    _this.removeSelectedClassFromAvailableEntitiesListItems();
    selectedLi.addClass('selected');
    _this.setEntitySelection();
  });
};

newReservationFormController.prototype.setEntitySelection = function() {
  var selCont = this.formContainer.find('div.selected-entity');
  selCont.text(this.currentAvailableEntities[this.selectedEntityId].name);
  selCont.removeClass('available unavailable warning-available');
  selCont.addClass(this.currentAvailableEntities[this.selectedEntityId].warning ? 'warning-available' : 'available');

  // Set the hidden form field for the entity for this reservation
  this.formContainer.find('input#reservation_entity_id').val(this.selectedEntityId);

  this.setSelectedEntitySlack();

  this.validateSlackFields();
};

newReservationFormController.prototype.validateSlackFields = function() {
  var _this = this;
  this.formContainer.find('#reservation_slack_before, #reservation_slack_after').each(function() {
    _this.setSlackFieldErrorState.call($(this));
  });
};

newReservationFormController.prototype.removeSelectedClassFromAvailableEntitiesListItems = function() {
  this.getAvailableEntitiesList().find('li').removeClass('selected');
};

newReservationFormController.prototype.setDefaultSlackTimes = function(default_slack_before, default_slack_after) {
  this.formContainer.find('input#reservation_slack_before').attr('placeholder', default_slack_before);
  this.formContainer.find('input#reservation_slack_after').attr('placeholder', default_slack_after);
};

newReservationFormController.prototype.setMaxSlackTimes = function(max_slack_before, max_slack_after) {
  this.formContainer.find('input#reservation_slack_before').data('max-slack', max_slack_before);
  this.formContainer.find('input#reservation_slack_after').data('max-slack', max_slack_after);
};

newReservationFormController.prototype.setSelectedEntitySlack = function() {
  var selEntity = this.currentAvailableEntities[this.selectedEntityId];
  this.setDefaultSlackTimes(selEntity.default_slack_before, selEntity.default_slack_after);
  this.setMaxSlackTimes(selEntity.max_slack_before, selEntity.max_slack_after);
};

newReservationFormController.prototype.bindOnChangeActions = function() {
  var _this = this;
  this.formContainer.find('input#begins_at_date, input#begins_at_tod, input#ends_at_date, input#ends_at_tod, select#entity_type_id').on('change', function() {
    _this.performFormUpdate.call(_this);
  });
};

newReservationFormController.prototype.performFormUpdate = function() {
  this.parseSelectedEntityFormField();
  if(this.parseBeginAndEndFromFormFields() && this.parseEntityTypeFormFields()) {
    this.updateAvailableEntities();
  }
};

newReservationFormController.prototype.parseSelectedEntityFormField = function() {
  var selE  = this.formContainer.find('input#reservation_entity_id').val();
  if($.isNumeric(selE)) {
    this.selectedEntityId = parseInt(selE, 10);
  } else {
    this.selectedEntityId = null;
  }
};

newReservationFormController.prototype.parseEntityTypeFormFields = function() {
  var entitySelector = this.formContainer.find('select#entity_type_id');
  if(entitySelector.val() != '') {
    this.entityTypeId = parseInt(entitySelector.val(), 10);
    return true;
  } else {
    this.clearAvailableEntitiesList();
  }
  return false;
};

newReservationFormController.prototype.parseBeginAndEndFromFormFields = function() {
  var beginsAtDateField = this.formContainer.find('input#begins_at_date');
  var beginsAtTodField = this.formContainer.find('input#begins_at_tod');
  var endsAtDateField = this.formContainer.find('input#ends_at_date');
  var endsAtTodField = this.formContainer.find('input#ends_at_tod');

  var beginValid = beginsAtDateField.val() != '' && beginsAtTodField.val() != '';

  var newBeginMoment = moment(beginsAtDateField.datepicker('getDate'));
  this.updateMomentWithTime(newBeginMoment, beginsAtTodField.timepicker('getTime'));

  beginValid = beginValid && newBeginMoment.isValid();
  if(beginValid) {
    this.beginMoment = newBeginMoment;
  }
  APP.util.setFieldErrorState(beginsAtDateField, !beginValid);
  APP.util.setFieldErrorState(beginsAtTodField, !beginValid);

  var endValid = endsAtDateField.val() != '' && endsAtTodField.val() != '';

  var newEndMoment = moment(endsAtDateField.datepicker('getDate'));
  this.updateMomentWithTime(newEndMoment, endsAtTodField.timepicker('getTime'));

  endValid = endValid && newEndMoment.isValid();
  if(endValid) {
    this.endMoment = newEndMoment;
  }
  APP.util.setFieldErrorState(endsAtDateField, !endValid);
  APP.util.setFieldErrorState(endsAtTodField, !endValid);

  return beginValid && endValid;
};

newReservationFormController.prototype.updateMomentWithTime = function(moment, timeString) {
  var hours = parseInt(timeString.split(':')[0], 10);
  var minutes = parseInt(timeString.split(':')[1], 10);
  moment.hours(hours);
  moment.minutes(minutes);
};

newReservationFormController.prototype.updateAvailableEntities = function() {
  var _this = this;
  $.ajax({
    type: 'POST',
    url: this.options.entities_controller_url + '/availability.json',
    data: {
      selected_entity_id: _this.selectedEntityId,
      entity_type_id: _this.entityTypeId,
      begins_at: _this.beginMoment.toJSON(),
      ends_at: _this.endMoment.toJSON()
    }
  }).success(function(response) {
    if(response.selected_entity) {
      _this.updateSelectedEntityFeedback(response.selected_entity);
    }
    _this.updateAvailableEntitiesList(response.entities);
  });
};

newReservationFormController.prototype.updateAvailableEntitiesList = function(entities) {
  var _this = this;
  this.clearAvailableEntitiesList();

  var entityList = this.getAvailableEntitiesList();
  this.showNoAvailableEntitiesListMessage(entities.length <= 0);

  $.each(entities, function(index, entity) {
    // Cache the entity info for later form settings during entity selection
    _this.currentAvailableEntities[entity.id] = entity;

    var newLi = $('<li>', {
      data: {
        entityId: entity.id
      },
      text: entity.name,
      css: {
        borderLeftColor: entity.color
      }
    });

    if(entity.id == _this.selectedEntityId) {
      newLi.addClass('selected');
    }

    if(entity.warning) {
      newLi.append($('<span>', { 'class': 'icon-warning-sign' }));
    }

    entityList.append(newLi);
  });
};

newReservationFormController.prototype.showNoAvailableEntitiesListMessage = function(visible) {
  this.formContainer.find('div.entity-selector div.no-entities-available')[visible ? 'show' : 'hide']();
};

newReservationFormController.prototype.updateSelectedEntityFeedback = function(feedback) {
  var selCont = this.formContainer.find('div.selected-entity');
  selCont.removeClass('available warning-available unavailable');
  if(!feedback.available) {
    selCont.addClass('unavailable');
  } else if(feedback.warning) {
    selCont.addClass('warning-available');
  } else {
    selCont.addClass('available');
  }

  this.setDefaultSlackTimes(feedback.default_slack_before, feedback.default_slack_after);
  this.setMaxSlackTimes(feedback.max_slack_before, feedback.max_slack_after);
  this.validateSlackFields();
};

newReservationFormController.prototype.clearAvailableEntitiesList = function() {
  this.getAvailableEntitiesList().html('');
};

newReservationFormController.prototype.getAvailableEntitiesList = function() {
  return this.formContainer.find('div.entity-selector ul.entity-list');
};
