APP.info_screens = {
  show: function() {
    APP.info_screens.realtimeFullscreensElemPlacement();
    APP.info_screens.realtimeFullscreensReservationDatesWidth();
    APP.info_screens.clock();
    $('body').append('<a id="fullscreen-link"><i class="icon-resize-full"></i></a>');
    $('#fullscreen-link').on('click', function() {APP.info_screens.requestFullScreen(document.getElementById('content'));});
    $(window).on('resize', function(){
      APP.info_screens.realtimeFullscreensElemPlacement();
      APP.info_screens.realtimeFullscreensReservationDatesWidth();
      if ((screen.height - $(window).height()) < 5) {
        $('#fullscreen-link').hide();
      } else {
        $('#fullscreen-link').show();
      }
    });
  },
  edit: function() {
    APP.info_screens.initCollapseThing();
  },
  'new': function() {
    APP.info_screens.initCollapseThing();
  },
  initCollapseThing: function() {
    $('input.info-screen-entity-type-active').on('change', function(){
      var input = $(this);
      var et = input.parents('div.info-screen-entity-type');
      if(input.is(':checked')) {
        et.find('h3 span.active-sign').addClass('active');
      } else {
        et.find('h3 span.active-sign').removeClass('active');
        et.find('div.info-screen-entity').find('h4 span.active-sign').removeClass('active');
        et.find('div.info-screen-entity input.info-screen-entity-active').prop('checked', false).trigger('change');
      }
    });

    $('input#direction_char_visible').on('change', function(){
      var checkbox = $(this);
      if(checkbox.is(':checked')) {
        $('div.direction-chars').show();
      } else {
        $('div.direction-chars').hide();
      }
    });

    $('input.info-screen-entity-active').on('change', function(){
      var input = $(this);
      var et = input.parents('div.info-screen-entity-type');
      if(input.is(':checked')) {
        et.find('h3 span.active-sign').addClass('active');
        et.find('input.info-screen-entity-type-active').prop('checked', true).trigger('change');
        input.parents('div.info-screen-entity').find('h4 span.active-sign').addClass('active');
      } else {
        input.parents('div.info-screen-entity').find('h4 span.active-sign').removeClass('active');
      }
    });

    $('div.info-screen-entity-type div.info-screen-entity div.direction-chars').on('click', 'div.wayfinding', function(){
        var item = $(this);
        item.siblings('div.wayfinding').removeClass('active');
        item.addClass('active');
        item.parents('div.direction-chars').find('input').val(item.find('i').attr('class'));
    });


    $(".info-screen-entity-type, .info-screen-entity").collapse({ });

    $("input").trigger("change");
  },
  realtimeFullscreensElemPlacement: function() {
    $('#realtime-list > li > .inner .info-container').each(function(){
      $(this).css('margin-top', ($(this).parent().height() / 2) - ($(this).height() / 2) + 'px');
    });
  },
  realtimeFullscreensReservationDatesWidth: function() {
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
  },
  requestFullScreen: function(el) {
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
  },
  clock: function() {
    var now = moment();
    // add a zero in front of numbers<10
    day=now.format('dd');
    date=now.format('D MMM YYYY');
    h=now.format('HH');
    m=now.format('mm');
    s=now.format('ss');
    $('.current-time').html('<span class="current-day">' + day + '</span> <span class="current-date">' + date + '</span> <span class="current-hour">' + h +  '</span>:<span class="current-minute">' + m + '</span><span class="current-second"> ' + s + '</span>');
    t=setTimeout(function(){APP.info_screens.clock()},100);
  },
};