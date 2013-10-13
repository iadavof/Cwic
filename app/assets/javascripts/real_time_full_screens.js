$(document).ready(function() {
  realtimeFullscreensElemPlacement();
});

$(window).on('resize', function(){
  realtimeFullscreensElemPlacement();
});

function realtimeFullscreensElemPlacement() {
  $('#realtime-list > li > .inner .info-container').each(function(){
    $(this).css('margin-top', ($(this).parent().height() / 2) - ($(this).height() / 2) + 'px');
  });
  var reservationDatesMaxWidth = 0;
  $('#realtime-list > li > .inner .reservation-dates').each(function(){
    if($(this).width() > reservationDatesMaxWidth) {
      reservationDatesMaxWidth = $(this).width();
    }
  });
  $('#realtime-list > li > .inner .reservation-dates').css('width', reservationDatesMaxWidth + 'px');
}