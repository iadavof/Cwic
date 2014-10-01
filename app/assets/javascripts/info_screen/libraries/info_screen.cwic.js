function CwicInfoScreen(options) {
  this.options = $.extend({
    container: 'info-screen-container',
    backend_url: 'url to info screen backend',
    websocket_url: 'url to websocket',
    organisation_id: 0,
    updateTimeout: 1800000
  }, options || {});

  this.infoScreenContainer = $('#' + this.options.container);
  this.previousSettings = null;

  this.clockInterval = null;
  this.infoScreenUpdateInterval = null;
  this.overdueRemoveInterval = null;

  this.init();
}

CwicInfoScreen.prototype.initWebSocket = function() {
  var is = this;
  var dispatcher = new WebSocketRails(this.options.websocket_url);
  // open reservations_channel for organisation
  if(typeof window.cwic_info_screen_channel === 'undefined') {
    window.cwic_info_screen_channel = dispatcher.subscribe('infoscreens_' + this.options.organisation_id);
    window.cwic_info_screen_channel.bind('update', function() { is.scheduleFastUpdate(); });
  }
};

CwicInfoScreen.prototype.init = function() {
  var is = this;

  this.realtimeFullscreensElemPlacement();

  // fullscreen button
  this.initFullScreenControls();

  this.getInfoScreenItems();

  this.initWebSocket();

  this.overdueRemoveInterval = setInterval(function() { is.eatOverdueItems(); }, 20000);
  this.infoScreenUpdateInterval = setInterval(function() { is.getInfoScreenItems(); }, this.options.updateTimeout);
};

CwicInfoScreen.prototype.scheduleFastUpdate = function() {
  var is = this;
  if(this.infoScreenUpdateInterval) {
    console.log('interupting normal update interval.');
    clearInterval(this.infoScreenUpdateInterval);
    this.infoScreenUpdateInterval = null;
    setTimeout(function(){
      is.getInfoScreenItems();
      is.infoScreenUpdateInterval = setInterval(function(){ is.getInfoScreenItems(); }, is.options.updateTimeout);
      console.log('continuing with normal update interval.');
    }, 3000);
    console.log('fast update scheduled for 3 sec...');
  } // else: There is already a fast update scheduled, do nothing
};

CwicInfoScreen.prototype.removeDeletedItems = function(reservations) {
  var reservationIds = [];
  $.each(reservations, function(index, item) {
    reservationIds.push(item.id);
  });

  var view_reservations = this.infoScreenContainer.find('ul#realtime-list').children('li.infoScreenListItem');
  view_reservations.each(function(index, item) {
    item = $(item);
    if($.inArray(parseInt(item.attr('id').split('_')[1], 10), reservationIds) < 0) {
      item.slideUp(300, function(){ $(this).remove(); });
    }
  });
};

CwicInfoScreen.prototype.reservationAnimation = function(on) {
  var tables = this.infoScreenContainer.find('table.reservation-dates');
  tables.each(function(index, item) {
    var table = $(item);
    if(on && !table.hasClass('animating')) {
      table.addClass('animating');
    } else {
      table.removeClass('animating');
      // -> triggering reflow /* The actual magic */
      // without this it wouldn't work. Try uncommenting the line and the transition won't be retriggered.
      table.offsetWidth = tables.offsetWidth;
    }
  });
};

CwicInfoScreen.prototype.itemUpdate = function(reservations) {
  // Stop the reservation table animations
  this.reservationAnimation(false);

  // Remove reservations that do not exist anymore in the reservations
  this.removeDeletedItems(reservations);

  var is = this;
  var list = this.infoScreenContainer.find('ul#realtime-list');
  $.each(reservations, function(index, reservation) {
    var newItem = is.createReservationItem(reservation);
    // Remove old item if already showed and begin date is not the same
    var oldItem = is.infoScreenContainer.find('#reservation_' + reservation.id);
    var placed = false;
    if(oldItem.length > 0) {
      if(oldItem.data('begin_unix') != reservation.begin_unix) {
        oldItem.slideUp(300, function() { $(this).remove(); });
      } else {
        oldItem.replaceWith(newItem);
        placed = true;
      }
    }
    var view_reservations = list.children('li.infoScreenListItem');
    view_reservations.each(function(index, item) {
      item = $(item);
      if(reservation.begin_unix < item.data('begin_unix')) {
        item.before(newItem);
        item.slideDown(300);
        placed = true;
        return false;
      }
    });
    if(!placed) {
      // append at the end
      list.append(newItem);
      newItem.slideDown(300);
    }
  });

  this.reservationAnimation(true);
};

CwicInfoScreen.prototype.eatOverdueItems = function() {
  var view_reservations = this.infoScreenContainer.find('ul#realtime-list').children('li.infoScreenListItem');
  var currentTime = moment().unix();

  view_reservations.each(function(index, item) {
    item = $(item);
    if(item.data('end_unix') > currentTime) {
      return false;
    } else {
      item.slideUp(300, function() { $(this).remove(); });
    }
  });
};

CwicInfoScreen.prototype.createReservationItem = function(reservation) {
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
    from.find('td.date span.day-full').text(res_begin_moment.format('ll'));
  }
  from.find('td.time span').text(res_begin_moment.format('LT'));

  var until = item.find('div.reservation-dates-wrapper table.reservation-dates tr.datebox.until');
  if(moment().isSame(res_end_moment, 'day')) {
    until.find('td.date').addClass('today');
    until.find('td.date span.day-full').text(jsLang.info_screen.today);
  } else {
    until.find('td.date span.day').text(res_end_moment.format('dd'));
    until.find('td.date span.day-full').text(res_end_moment.format('ll'));
  }
  until.find('td.time span').text(res_end_moment.format('LT'));

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
      wayfinding.find('i').attr('class', reservation.direction_char);
    }
  } else {
    wayfinding.hide();
  }

  return item;

};

CwicInfoScreen.prototype.settingsUpdate = function(settings) {
  var is = this;

  if(this.previousSettings == null || settings.clock_header != this.previousSettings.clock_header) {
    if(settings.clock_header) {
      this.clockInterval = setInterval(function() { is.updateClock(); }, 100);
      this.infoScreenContainer.find('div.info-screen-header').slideDown(500);
    } else {
      this.infoScreenContainer.find('div.info-screen-header').slideUp(500, function() { clearInterval(is.clockInterval); });
    }
  }

  this.previousSettings = settings;
};

CwicInfoScreen.prototype.getInfoScreenItems = function() {
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
};

CwicInfoScreen.prototype.setOnResize = function() {
  var is = this;
  $(window).on('resize', function() {
    is.realtimeFullscreensElemPlacement();
    is.realtimeFullscreensReservationDatesWidth();
    $('#fullscreen-link').toggle(screen.height - $(window).height() < 5);
  });
};

CwicInfoScreen.prototype.initFullScreenControls = function() {
  var is = this;
  $('body').append($('<a>', {id: 'fullscreen-link'}).html($('<i>', {'class':'icon-resize-full'})));
  $('#fullscreen-link').on('click', function() {
    is.requestFullScreen(document.getElementById('content'));
  });
};

CwicInfoScreen.prototype.realtimeFullscreensElemPlacement = function() {
  $('#realtime-list > li > .inner .info-container').each(function(){
    $(this).css('margin-top', ($(this).parent().height() / 2) - ($(this).height() / 2) + 'px');
  });
};

CwicInfoScreen.prototype.requestFullScreen = function(el) {
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
};

CwicInfoScreen.prototype.updateClock = function() {
  var now = moment();
  $('.current-time').html(now.format('[<span class="current-day">]dd[</span> <span class="current-date">]D MMM YYYY[</span><span class="current-hour">]HH[</span>:<span class="current-minute">]mm[</span><span class="current-second"> ]ss[</span>]'));
};

CwicInfoScreen.prototype.getTemplateClone = function(id) {
  var item = $('#info-screen-templates').find('#' + id).clone();
  item.removeAttr('id');
  item.show();
  return item;
};
