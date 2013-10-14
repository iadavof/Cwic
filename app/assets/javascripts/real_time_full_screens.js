APP.real_time_full_screens = {
  show: function() {
    realtimeFullscreensElemPlacement();
    realtimeFullscreensReservationDatesWidth();
    $('body').append('<a id="fullscreen-link"><i class="icon-resize-full"></i></a>');
    $('#fullscreen-link').on('click', function() {requestFullScreen(document.getElementById('content'));})
    $(window).on('resize', function(){
      realtimeFullscreensElemPlacement();
      realtimeFullscreensReservationDatesWidth();
      if ((screen.height - $(window).height()) < 5) {
        $('#fullscreen-link').hide();
      } else {
        $('#fullscreen-link').show();
      }
    });
  }
};

function realtimeFullscreensElemPlacement() {
  $('#realtime-list > li > .inner .info-container').each(function(){
    $(this).css('margin-top', ($(this).parent().height() / 2) - ($(this).height() / 2) + 'px');
  });
}

function realtimeFullscreensReservationDatesWidth() {
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

function requestFullScreen(el) {
    // Supports most browsers and their versions.
    var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(el);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        try {
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                alert('Druk op F11 om volledig scherm te sluiten.');
                wscript.SendKeys("{F11}");
            }
        } catch(e) {
            alert('Volledig scherm kon niet worden geopend. Klik op OK en druk op de toets F11 om het scherm handmatig te maximaliseren.\n\n' + e);
        }
    }
    return false;
}