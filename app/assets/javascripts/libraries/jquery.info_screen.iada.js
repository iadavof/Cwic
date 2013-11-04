function IADAinfoScreen(options) {
  this.options = Object.extend({
    container: 'content',
    clock_header: true,
    directions: true,
  }, options || {});

  this.infoScreenContainer = $('#' + this.options.container);
  this.init();
}

IADAinfoScreen.prototype.init = function() {
  var is = this;
  if(this.options.clock_header) {
    this.infoScreenContainer.find('div.info-screen-header').show();
    setInterval(function() { is.updateClock() }, 100);
  }
}

IADAinfoScreen.prototype.itemUpdate = function() {

}

IADAinfoScreen.prototype.setOnResize = function() {
  var is = this;
  $(window).on('resize', function(){
    is.realtimeFullscreensElemPlacement();
    is.realtimeFullscreensReservationDatesWidth();
    if ((screen.height - $(window).height()) < 5) {
      $('#fullscreen-link').hide();
    } else {
      $('#fullscreen-link').show();
    }
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
  $('#realtime-list > li > .inner .reservation-dates .datebox .from, #realtime-list > li > .inner .reservation-dates .datebox .until').css('width', reservationDatesGreatestWidth['icon'] + 'px');
  $('#realtime-list > li > .inner .reservation-dates .datebox .date').css('width', reservationDatesGreatestWidth['date'] + 'px');
  $('#realtime-list > li > .inner .reservation-dates .datebox .time').css('width', reservationDatesGreatestWidth['time'] + 'px');
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
  $('.current-time').html(now.format('[<span class="current-day">]dd[</span><span class="current-date">]D MM YYYY[</span><span class="current-hour">]HH[</span>:<span class="current-minute">]mm[</span><span class="current-second">]ss[</span>]'));
}