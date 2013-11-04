APP.info_screens = {
  show: function() {
    APP.info_screens.realtimeFullscreensElemPlacement();
    APP.info_screens.realtimeFullscreensReservationDatesWidth();
    APP.info_screens.clock();
    $('body').append('<a id="fullscreen-link"><i class="icon-resize-full"></i></a>');
    $('#fullscreen-link').on('click', function() {APP.info_screens.requestFullScreen(document.getElementById('content'));})
  },
  edit: function() {
    APP.info_screens.initCollapseThing();
  },
  new: function() {
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
        et.find('div.info-screen-entity input.info-screen-entity-active').prop('checked', false);
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
        et.find('input.info-screen-entity-type-active').prop('checked', true);
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
};