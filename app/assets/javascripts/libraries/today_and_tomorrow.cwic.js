function CwicTodayAndTomorrow(options) {
  this.options = $.extend({
    container: 'schedule-container',
    backend_url: 'url to backend',
    organisation_id: 0,
    websocket_url: 'url to websocket',
  }, options || {});

  this.renderTodayAndTomorrow();
};

CwicTodayAndTomorrow.prototype.renderTodayAndTomorrow = function() {
  this.scheduleContainer = $('#' + this.options.container);
  this.bindEntityInfoControls();
  this.initWebSocket();
  this.updateTodayTomorrowView();
  var schedule = this;
  setInterval(function() {schedule.updateTodayTomorrowView();}, 300000);
};

CwicTodayAndTomorrow.prototype.initWebSocket = function() {
  var tat = this;
  var dispatcher = new WebSocketRails(this.options.websocket_url);
  // Open reservations_channel for organisation
  var channel = dispatcher.subscribe('todayandtomorrows_' + this.options.organisation_id);

  channel.bind('update', function() { tat.updateTodayTomorrowView(); });
};

CwicTodayAndTomorrow.prototype.bindEntityInfoControls = function() {
  this.scheduleContainer.find('p.entity-name').on('click', function() {
    var $description = $(this).siblings('.entity-description');
    var descriptionHeight = $description.height();
    
    if($description.hasClass('opened')) {
      $description.velocity({height: 0}, 200, 'swing', function(){
        $description.css({display: 'none', height: 'auto'}).removeClass('opened');
      });
    } else {
      $description.css({height: 0, display: 'block'});
      $description.velocity({height: descriptionHeight}, 200, 'swing', function() {
        $description.css({height: 'auto'}).addClass('opened');
      });
    }
  });
};

CwicTodayAndTomorrow.prototype.updateTodayTomorrowView = function() {
  var tat = this;
  $.ajax({
    type: 'GET',
    url: this.options.backend_url,
    data: {

    }
  }).success(function(response) {
    tat.afterTodayTomorrowUpdate(response);
  });
};

CwicTodayAndTomorrow.prototype.afterTodayTomorrowUpdate = function(response) {
  if(response.length == 1) {
    this.afterTodayTomorrowUpdateEntity(response[0].entities, this.scheduleContainer);
  } else {
    for(var entity_type_array_nr in response) {
      var jentity_type = this.scheduleContainer.find('#entity_type_' + response[entity_type_array_nr].entity_type_id);
      this.afterTodayTomorrowUpdateEntity(response[entity_type_array_nr].entities, jentity_type);
    }
  }
};

CwicTodayAndTomorrow.prototype.afterTodayTomorrowUpdateEntity = function(entity_type_info, parentdiv) {
  for(var entity_array_nr in entity_type_info) {
    var entity = entity_type_info[entity_array_nr];
    var jentity = parentdiv.find('#entity_' + entity.entity_id);
    jentity = jentity.find('div.updated-info').html('');
    this.createNewUpdatedInfo(entity, jentity);
  }
};

CwicTodayAndTomorrow.prototype.createNewUpdatedInfo = function(entity, parentdiv) {
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
};

CwicTodayAndTomorrow.prototype.getTemplateClone = function(id) {
  var newitem = $('#tat-templates').find('#' + id).clone();
  newitem.removeAttr('id');
  newitem.show();
  return newitem;
};
