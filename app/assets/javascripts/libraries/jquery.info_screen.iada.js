function IADAinfoScreen(options) {
  this.options = Object.extend({
    container: 'info-screen-container',
    backend_url: 'url to info screen backend',
    websocket_url: 'url to websocket',
    organisation_id: 0,
    updateTimeout: 50000,
  }, options || {});

  this.infoScreenContainer = $('#' + this.options.container);
  this.previousSettings = null;

  this.clockInterval = null;
  this.infoScreenUpdateInterval = null;
  this.overdueRemoveInterval = null;

  this.init();
}

IADAinfoScreen.prototype.initWebSocket = function() {
  var is = this;
  var dispatcher = new WebSocketRails(this.options.websocket_url);
  // open reservations_channel for organisation
  var channel = dispatcher.subscribe('reservations_' + this.options.organisation_id);

  channel.bind('save', function() { is.getInfoScreenItems(); });
}

IADAinfoScreen.prototype.init = function() {
  var is = this;

  this.realtimeFullscreensElemPlacement();

  // fullscreen button
  this.initFullScreenControls();

  this.getInfoScreenItems();

  this.initWebSocket();

  this.overdueRemoveInterval = setInterval(function() { is.eatOverdueItems(); }, 20000);
  this.infoScreenUpdateInterval = setInterval(function() { is.getInfoScreenItems(); }, this.options.updateTimeout);
}

IADAinfoScreen.prototype.removeDeletedItems = function(reservations) {
  var reservationIds = [];
  $.each(reservations, function(index, item) {
    reservationIds.push(item.id);
  });

  var view_reservations = this.infoScreenContainer.find('ul#realtime-list').children('li.infoScreenListItem');
  view_reservations.each(function(index, item) {
    var item = $(item);
    if($.inArray(parseInt(item.attr('id').split('_')[1]), reservationIds) < 0) {
      item.slideUp(300, function(){ $(this).remove(); });
    }
  });
}

IADAinfoScreen.prototype.itemUpdate = function(reservations) {
  // Remove reservations that do not exist anymore in the reservations
  this.removeDeletedItems(reservations);

  var is = this;
  var list = this.infoScreenContainer.find('ul#realtime-list');
  $.each(reservations, function(index, reservation) {
    var newItem = is.createReservationItem(reservation);

    // Remove old item if already showed and begin date is not the same
    var oldItem = is.infoScreenContainer.find('#reservation_' + reservation.id);
    if(oldItem.length > 0) {
      if(oldItem.data('begin_unix') != reservation.begin_unix) {
        oldItem.slideUp(300, function() { $(this).remove(); });
      } else {
        oldItem.replaceWith(newItem);
      }
    } else {
      var placed = false;
      var view_reservations = list.children('li.infoScreenListItem');
      view_reservations.each(function(index, item) {
        var item = $(item);
        if(reservation.begin_unix < item.data('begin_unix')) {
          item.before(newItem);
          placed = true;
          return false;
        }
      });
      if(!placed) {
        // append at the end
        list.append(newItem);
      }
    }
  });
}

IADAinfoScreen.prototype.eatOverdueItems = function() {
  var view_reservations = this.infoScreenContainer.find('ul#realtime-list').children('li.infoScreenListItem');
  var currentTime = moment().unix();

  view_reservations.each(function(index, item) {
    var item = $(item);
    if(item.data('end_unix') > currentTime) {
      return false;
    } else {
      item.slideUp(300, function() { $(this).remove(); });
    }
  });
}

IADAinfoScreen.prototype.createReservationItem = function(reservation) {
  var item = this.getTemplateClone('listItemTemplate');
  item.attr('id', 'reservation_' + reservation.id);
  var res_begin_moment = moment(reservation.begin_moment);
  var res_end_moment = moment(reservation.end_moment);

  item.data('begin_unix', reservation.begin_unix);
  item.data('end_unix', reservation.end_unix);
  var from = item.find('div.reservation-dates-wrapper table.reservation-dates tr.datebox.from');
  if(moment().isSame(res_begin_moment, 'day')) {
    from.find('td.date').addClass('today');
    from.find('td.date span.day-full').text(jsLang.info_screen.today);
  } else {
    from.find('td.date span.day').text(res_begin_moment.format('dd'));
    from.find('td.date span.day-full').text(res_begin_moment.format('D MMM YYYY'));
  }
  from.find('td.time span').text(res_begin_moment.format('HH:mm'));

  var until = item.find('div.reservation-dates-wrapper table.reservation-dates tr.datebox.until');
  if(moment().isSame(res_end_moment, 'day')) {
    until.find('td.date').addClass('today');
    until.find('td.date span.day-full').text(jsLang.info_screen.today);
  } else {
    until.find('td.date span.day').text(res_end_moment.format('dd'));
    until.find('td.date span.day-full').text(res_end_moment.format('D MMM YYYY'));
  }
  until.find('td.time span').text(res_end_moment.format('HH:mm'));

  item.find('h2').text(reservation.description);
  item.find('div.object').text(reservation.entity_name);

  item.css('border-left-color', reservation.color);

  var availabilityDiv = item.find('div.availability');
  if(reservation.availability != null) {
    availabilityDiv.show();
    if(reservation.availability == 0) {
      availabilityDiv.addClass('not-available');
      availabilityDiv.text(jsLang.info_screen.none_available);
    } else {
      availabilityDiv.addClass('available');
      availabilityDiv.html((reservation.availability == 1) ? jsLang.info_screen.one_available : str_replace(jsLang.info_screen.more_available, '%nr', '<strong>' + reservation.availability) + '</strong>');
    }
  }


  var wayfinding = item.find('div.wayfinding');
  if(this.previousSettings.direction_char_visible) {
    wayfinding.show();
    if(reservation.direction_char != null) {
      wayfinding.find('i').attr('class', reservation.direction_char)
    }
  } else {
    wayfinding.hide();
  }

  return item;

}

IADAinfoScreen.prototype.settingsUpdate = function(settings) {
  var is = this;

  if(this.previousSettings == null || settings.clock_header != this.previousSettings.clock_header) {
    if(settings.clock_header) {
      this.clockInterval = setInterval(function() { is.updateClock() }, 100);
      this.infoScreenContainer.find('div.info-screen-header').slideDown(500);
    } else {
      this.infoScreenContainer.find('div.info-screen-header').slideUp(500, function() { clearInterval(is.clockInterval); });
    }
  }

  this.previousSettings = settings;
}

IADAinfoScreen.prototype.getInfoScreenItems = function() {
  var is = this;

  $.ajax({
    type: 'GET',
    url: this.options.backend_url + '.json',
    data: {

    }
  }).success(function(response) {
    is.settingsUpdate(response.settings);
    is.itemUpdate(response.reservations);
  });
}

IADAinfoScreen.prototype.setOnResize = function() {
  var is = this;
  $(window).on('resize', function() {
    is.realtimeFullscreensElemPlacement();
    is.realtimeFullscreensReservationDatesWidth();
    if ((screen.height - $(window).height()) < 5) {
      $('#fullscreen-link').hide();
    } else {
      $('#fullscreen-link').show();
    }
  });
}

IADAinfoScreen.prototype.initFullScreenControls = function() {
  var is = this;
  $('body').append($('<a>', {id: 'fullscreen-link'}).html($('<i>', {class:'icon-resize-full'})));
  $('#fullscreen-link').on('click', function() {
    is.requestFullScreen(document.getElementById('content'));
  });
}

IADAinfoScreen.prototype.realtimeFullscreensElemPlacement = function() {
  $('#realtime-list > li > .inner .info-container').each(function(){
    $(this).css('margin-top', ($(this).parent().height() / 2) - ($(this).height() / 2) + 'px');
  });
}

IADAinfoScreen.prototype.requestFullScreen = function(el) {
  // Supports most browsers and their versions.
  var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;

  if (requestMethod) { // Native full screen.
      requestMethod.call(el);
  } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
      try {
          var wscript = new ActiveXObject("WScript.Shell");
          if (wscript !== null) {
              alert(jsLang.info_screen.pressF11);
              wscript.SendKeys("{F11}");
          }
      } catch(e) {
          alert(jsLang.info_screen.cannotOpenFullscreen + e);
      }
  }
  return false;
}

IADAinfoScreen.prototype.updateClock = function() {
  var now = moment();
  $('.current-time').html(now.format('[<span class="current-day">]dd[</span> <span class="current-date">]D MMM YYYY[</span><span class="current-hour">]HH[</span>:<span class="current-minute">]mm[</span><span class="current-second"> ]ss[</span>]'));
}

IADAinfoScreen.prototype.getTemplateClone = function(id) {
  var item = $('#info-screen-templates').find('#' + id).clone();
  item.removeAttr('id');
  item.show();
  return item;
}