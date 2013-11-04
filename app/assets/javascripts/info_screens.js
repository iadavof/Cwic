APP.info_screens = {
  show: function() {
    var fullScreen = new IADAinfoScreen({
      container: 'content',
      clock_header: $('#info-screen-container').data('clock-header'),
      directions: $('#info-screen-container').data('directions'),
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
};
