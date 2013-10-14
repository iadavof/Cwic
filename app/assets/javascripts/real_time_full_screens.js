$(document).ready(function() {
  realtimeFullscreensElemPlacement();
  realtimeFullscreensReservationDatesWidth();
});

$(window).on('resize', function(){
  realtimeFullscreensElemPlacement();
  realtimeFullscreensReservationDatesWidth();
});

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
    $(this).find('.datebox .time').css('width', 'auto');
    if($(this).find('.datebox .time').first().width() > reservationDatesGreatestWidth['time']) {
      reservationDatesGreatestWidth['time'] = $(this).find('.datebox .time').first().width();
    }
  });
  $('#realtime-list > li > .inner .reservation-dates .datebox .from, #realtime-list > li > .inner .reservation-dates .datebox .until').css('width', reservationDatesGreatestWidth['icon'] + 'px');
  $('#realtime-list > li > .inner .reservation-dates .datebox .date').css('width', reservationDatesGreatestWidth['date'] + 'px');
  $('#realtime-list > li > .inner .reservation-dates .datebox .time').css('width', reservationDatesGreatestWidth['time'] + 'px');
}