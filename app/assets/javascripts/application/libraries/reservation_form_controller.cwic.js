function CwicReservationFormController(options) {
  this.options = $.extend({
    container: '',
    entities_controller_url: 'url to backend'
  }, options || {});

  this.formContainer = null;
  this.slackBeforeField = null;
  this.slackAfterField = null;
  this.beginMoment = moment();
  this.endMoment = moment();
  this.reservationId = null;
  this.entityTypeId = null;
  this.selectedEntityId = null;
  this.selectedEntityData = null;
  this.availableEntities = {};

  this.init();
}

CwicReservationFormController.prototype.init = function() {
  this.formContainer = $('#' + this.options.container);
  this.beginsAtDateField = this.formContainer.find('input#begins_at_date');
  this.beginsAtTodField = this.formContainer.find('input#begins_at_tod');
  this.endsAtDateField = this.formContainer.find('input#ends_at_date');
  this.endsAtTodField = this.formContainer.find('input#ends_at_tod');
  this.slackBeforeField = this.formContainer.find('input#reservation_slack_before');
  this.slackAfterField = this.formContainer.find('input#reservation_slack_after');
  this.reservationId = this.formContainer.data('reservation-id');
  this.bindOnChangeActions();
  this.bindEntitySelection();
  this.performFormUpdate();
};

CwicReservationFormController.prototype.updateSlackFieldsWarningState = function() {
  this.updateSlackFieldWarningState('before');
  this.updateSlackFieldWarningState('after');
};

CwicReservationFormController.prototype.updateSlackFieldWarningState = function(which) {
  var value = this.slackValue(which);
  var maxSlack = this.maxSlack(which);
  APP.util.setFieldWarningState(this.slackField(which), (maxSlack !== null && value > maxSlack));
};

CwicReservationFormController.prototype.updatePeriodFieldsWarningState = function() {
  var beginsAtWarning = this.maxSlack('before') < 0;
  APP.util.setFieldWarningState(this.beginsAtDateField, beginsAtWarning);
  APP.util.setFieldWarningState(this.beginsAtTodField, beginsAtWarning);

  var endsAtWarning = this.maxSlack('after') < 0;
  APP.util.setFieldWarningState(this.endsAtDateField, endsAtWarning);
  APP.util.setFieldWarningState(this.endsAtTodField, endsAtWarning);
};

CwicReservationFormController.prototype.bindEntitySelection = function() {
  var _this = this;
  this.getAvailableEntitiesList().on('click', 'li', function() {
    selectedLi = $(this);
    _this.setSelectedEntity(selectedLi.data('entity-id'));
    _this.removeSelectedClassFromAvailableEntitiesListItems();
    selectedLi.addClass('selected');
  });
};

CwicReservationFormController.prototype.setSelectedEntity = function(entityId) {
  this.selectedEntityId = entityId;
  this.selectedEntityData = this.availableEntities[this.selectedEntityId];
  this.formContainer.find('input#reservation_entity_id').val(this.selectedEntityId); // Set the hidden form field for the entity for this reservation
  this.formContainer.find('div.selected-entity').text(this.selectedEntityData.name);
  this.selectedEntityDataChanged();
};

CwicReservationFormController.prototype.removeSelectedClassFromAvailableEntitiesListItems = function() {
  this.getAvailableEntitiesList().find('li').removeClass('selected');
};

CwicReservationFormController.prototype.updateSlackFieldsPlaceholder = function() {
  this.slackBeforeField.attr('placeholder', this.defaultSlack('before'));
  this.slackAfterField.attr('placeholder', this.defaultSlack('after'));
};

CwicReservationFormController.prototype.bindOnChangeActions = function() {
  var _this = this;
  this.formContainer.find('input#begins_at_date, input#begins_at_tod, input#ends_at_date, input#ends_at_tod, select#entity_type_id').on('change', function() {
    _this.performFormUpdate();
  });
  this.formContainer.find('input#reservation_slack_before, input#reservation_slack_after').on('change', function() {
    _this.slackFieldsChanged();
  });
};

CwicReservationFormController.prototype.performFormUpdate = function() {
  this.parseSelectedEntityFormField();
  if(this.parseBeginAndEndFromFormFields() && this.parseEntityTypeFormFields()) {
    this.updateAvailableEntities();
  }
};

CwicReservationFormController.prototype.parseSelectedEntityFormField = function() {
  var selE = this.formContainer.find('input#reservation_entity_id').val();
  if($.isNumeric(selE)) {
    this.selectedEntityId = parseInt(selE, 10);
  } else {
    this.selectedEntityId = null;
  }
};

CwicReservationFormController.prototype.parseEntityTypeFormFields = function() {
  var entitySelector = this.formContainer.find('select#entity_type_id');
  if(entitySelector.val() != '') {
    this.entityTypeId = parseInt(entitySelector.val(), 10);
    return true;
  } else {
    this.clearAvailableEntitiesList();
  }
  return false;
};

CwicReservationFormController.prototype.parseBeginAndEndFromFormFields = function() {
  var beginValid = this.beginsAtDateField.val() !== '' && this.beginsAtTodField.val() !== '';

  var newBeginMoment = moment(this.beginsAtDateField.datepicker('getDate'));
  this.updateMomentWithTime(newBeginMoment, this.beginsAtTodField.timepicker('getTime'));

  beginValid = beginValid && newBeginMoment.isValid();
  if(beginValid) {
    this.beginMoment = newBeginMoment;
  }
  APP.util.setFieldErrorState(this.beginsAtDateField, !beginValid);
  APP.util.setFieldErrorState(this.beginsAtTodField, !beginValid);

  var endValid = this.endsAtDateField.val() !== '' && this.endsAtTodField.val() !== '';

  var newEndMoment = moment(this.endsAtDateField.datepicker('getDate'));
  this.updateMomentWithTime(newEndMoment, this.endsAtTodField.timepicker('getTime'));

  endValid = endValid && newEndMoment.isValid();
  if(endValid) {
    this.endMoment = newEndMoment;
  }
  APP.util.setFieldErrorState(this.endsAtDateField, !endValid);
  APP.util.setFieldErrorState(this.endsAtTodField, !endValid);

  return beginValid && endValid;
};

CwicReservationFormController.prototype.updateMomentWithTime = function(moment, timeString) {
  var hours = parseInt(timeString.split(':')[0], 10);
  var minutes = parseInt(timeString.split(':')[1], 10);
  moment.hours(hours);
  moment.minutes(minutes);
};

CwicReservationFormController.prototype.updateAvailableEntities = function() {
  var _this = this;
  $.ajax({
    type: 'POST',
    url: this.options.entities_controller_url + '/availability.json',
    data: {
      ignore_reservation_ids: _this.reservationId,
      selected_entity_id: _this.selectedEntityId,
      entity_type_id: _this.entityTypeId,
      begins_at: _this.beginMoment.toJSON(),
      ends_at: _this.endMoment.toJSON()
    }
  }).success(function(response) { _this.updateAvailableEntitiesSuccessCallback(response); });
};

CwicReservationFormController.prototype.updateAvailableEntitiesSuccessCallback = function(response) {
  _this = this;

  if(response.selected_entity) {
    this.selectedEntityData = response.selected_entity;
    this.selectedEntityDataChanged();
  }

  // Store the available entities data
  this.availableEntities = {};
  $.each(response.entities, function(index, entity) {
    // Cache the entity info for later form settings during entity selection
    _this.availableEntities[entity.id] = entity;
  });

  this.renderAvailableEntitiesList();
};

CwicReservationFormController.prototype.renderAvailableEntitiesList = function() {
  var _this = this;
  this.clearAvailableEntitiesList();

  var entityList = this.getAvailableEntitiesList();
  this.showNoAvailableEntitiesListMessage(this.availableEntities.length <= 0);

  $.each(this.availableEntities, function(index, entity) {
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

    if(_this.entitySlackOverlap(entity)) {
      newLi.append($('<span>', { 'class': 'icon-warning-sign' }));
    }

    entityList.append(newLi);
  });
};

CwicReservationFormController.prototype.showNoAvailableEntitiesListMessage = function(visible) {
  this.formContainer.find('div.entity-selector div.no-entities-available')[visible ? 'show' : 'hide']();
};

CwicReservationFormController.prototype.selectedEntityDataChanged = function() {
  this.updateSlackFieldsPlaceholder();
  this.updateSlackFieldsWarningState();
  this.updatePeriodFieldsWarningState();
  this.updateSelectedEntityClass();
};

CwicReservationFormController.prototype.updateSelectedEntityClass = function() {
  var selCont = this.formContainer.find('div.selected-entity');
  selCont.removeClass('available warning-available unavailable');
  if(!this.selectedEntityData.available) {
    selCont.addClass('unavailable');
  } else if(this.entitySlackOverlap(this.selectedEntityData)) {
    selCont.addClass('warning-available');
  } else {
    selCont.addClass('available');
  }
};

CwicReservationFormController.prototype.slackFieldsChanged = function() {
  this.updateSlackFieldsWarningState();
  this.updateSelectedEntityClass();
  this.renderAvailableEntitiesList();
};

CwicReservationFormController.prototype.clearAvailableEntitiesList = function() {
  this.getAvailableEntitiesList().html('');
};

CwicReservationFormController.prototype.getAvailableEntitiesList = function() {
  return this.formContainer.find('div.entity-selector ul.entity-list');
};

CwicReservationFormController.prototype.entitySlackOverlap = function(entity) {
  return (entity.max_slack_before !== null && this.slackValue('before', entity.default_slack_before) > entity.max_slack_before) || (entity.max_slack_after !== null && this.slackValue('after', entity.default_slack_after) > entity.max_slack_after);
};

CwicReservationFormController.prototype.slackField = function(which) {
  return (which == 'before' ? this.slackBeforeField : ( which == 'after' ? this.slackAfterField : null));
};

CwicReservationFormController.prototype.defaultSlack = function(which) {
  return this.selectedEntityData['default_slack_'+ which];
};

CwicReservationFormController.prototype.maxSlack = function(which) {
  return this.selectedEntityData['max_slack_'+ which];
};

CwicReservationFormController.prototype.slackValue = function(which, def) {
  value = this.slackField(which).val();
  if(typeof def === 'undefined') {
    def = this.defaultSlack(which);
  }
  if(value !== '') {
    return parseInt(value, 10);
  } else if(def !== null) { // The value is not set, so we check the default value
    return def;
  } else {
    return null;
  }
};
