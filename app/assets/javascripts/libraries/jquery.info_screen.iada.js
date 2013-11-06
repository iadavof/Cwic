function IADAinfoScreen(options) {
  this.options = Object.extend({
    container: 'info-screen-container',
    backend_url: 'url to info screen backend',
    updateTimeout: 1000,
  }, options || {});

  this.infoScreenContainer = $('#' + this.options.container);
  this.previousSettings = null;

  this.clockInterval = null;
  this.infoScreenUpdateInterval = null;

  this.init();
}

IADAinfoScreen.prototype.init = function() {
  var is = this;

  this.realtimeFullscreensElemPlacement();
  this.realtimeFullscreensReservationDatesWidth();

  // fullscreen button
  this.initFullScreenControls();

  this.getInfoScreenItems();
  this.infoScreenUpdateInterval = setInterval(function() { is.getInfoScreenItems(); }, this.options.updateTimeout);
}

IADAinfoScreen.prototype.itemUpdate = function(reservations) {
  var is = this;
  var list = this.infoScreenContainer.find('#realtime-list');

  $.each(reservations, function(index, reservation) {
    var newItem = is.createReservationItem(reservation);
    if(is.infoScreenContainer.find('reservation_' + reservation.id).length > 0) {
      is.infoScreenContainer.find('reservation_' + reservation.id).replaceWith(newItem);
    } else {
      var placed = false;
      var view_reservations = list.children('li.infoScreenListItem');
      view_reservations.each(function(index, item) {
        if(reservation.begin_unix > item.data('begin_unix')) {
          item.prepend(newItem);
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

IADAinfoScreen.prototype.createReservationItem = function(reservation) {
  var item = this.getTemplateClone('listItemTemplate');
  item.attr('id', 'reservation_' + reservation.id);
  var res_begin_moment = moment(reservation.begin_moment);
  var res_end_moment = moment(reservation.end_moment);

  item.data('begin_unix', reservation.begin_unix);
  var from = item.find('div.reservation-dates-wrapper table.reservation-dates tr.datebox.from');
  if(moment().isSame(res_begin_moment, 'day')) {
    from.find('td.date').addClass('today');
    from.find('td.date span').text(jsLang.info_screen.today);
  } else {
    from.find('td.date span.day').text(res_begin_moment.format('dd'));
    from.find('td.date span.day-full').text(res_begin_moment.format('D MMM YYYY'));
  }
  from.find('td.time span').text(res_begin_moment).find('HH:mm');

  var until = item.find('div.reservation-dates-wrapper table.reservation-dates tr.datebox.until');
  if(moment().isSame(res_end_moment, 'day')) {
    until.find('td.date').addClass('today');
    until.find('td.date span').text(jsLang.info_screen.today);
  } else {
    until.find('td.date span.day').text(res_end_moment.format('dd'));
    until.find('td.date span.day-full').text(res_end_moment.format('D MMM YYYY'));
  }
  until.find('td.time span').text(res_end_moment).find('HH:mm');

  item.find('h2').text(reservation.description);
  item.find('div.object').text(reservation.entity_name);

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
  if(this.previousSettings.direction_char) {
    wayfinding.show();
    if(reservation.direction_char != null) {
      wayfinding.find('i').attr('class', reservation.direction_char)
    }
  } else {
    wayfinding.hide();
  }

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

IADAinfoScreen.prototype.realtimeFullscreensReservationDatesWidth = function() {
  var reservationDatesGreatestWidth = { icon: 0, date: 0, time: 0 };
  $('#realtime-list > li > .inner .reservation-dates').each(function(){
    $(this).find('.datebox .from, .datebox .until').css('width', 'auto');
    if($(this).find('.datebox .from').first().width() > reservationDatesGreatestWidth['icon']) {
      reservationDatesGreatestWidth['icon'] = $(this).find('.datebox .from').first().width();
    }
    $(this).find('.datebox .date').css('width', 'auto');
    if($(this).find('.datebox .date').first().width() > reservationDatesGreatestWidth['date']) {
      reservationDatesGreatestWidth['date'] = $(this).find('.datebox .date').first().width();
    }
    $(this).find('.datebox .tim                                                                                                                                                                                                                                       e').css('width', 'auto');
    if($(this).find('.datebox .time').first().width() > reservationDatesGreatestWidth['time']) {
      reservationDatesGreatestWidth['time'] = $(this).find('.datebox .time').first().width();
    }
  });
  this.infoScreenContainer.find('#realtime-list > li > .inner .reservation-dates .datebox .from, #realtime-list > li > .inner .reservation-dates .datebox .until').css('width', reservationDatesGreatestWidth['icon'] + 'px');
  this.infoScreenContainer.find('#realtime-list > li > .inner .reservation-dates .datebox .date').css('width', reservationDatesGreatestWidth['date'] + 'px');
  this.infoScreenContainer.find('#realtime-list > li > .inner .reservation-dates .datebox .time').css('width', reservationDatesGreatestWidth['time'] + 'px');
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