APP.frontends = {
  _form: function() {
    APP.frontends.initCollapseThing();
  },
  initCollapseThing: function() {
    $('input.frontend-entity-type-active').on('change', function(){
      var input = $(this);
      var et = input.parents('div.frontend-entity-type');
      if(input.is(':checked')) {
        et.find('h3 span.active-sign').addClass('active');
      } else {
        et.find('h3 span.active-sign').removeClass('active');
        et.find('div.frontend-entity').find('h4 span.active-sign').removeClass('active');
        et.find('div.frontend-entity input.frontend-entity-active').prop('checked', false).trigger('change');
      }
    });

    $('input.frontend-entity-active').on('change', function(){
      var input = $(this);
      var et = input.parents('div.frontend-entity-type');
      if(input.is(':checked')) {
        et.find('h3 span.active-sign').addClass('active');
        et.find('input.frontend-entity-type-active').prop('checked', true).trigger('change');
        input.parents('div.frontend-entity').find('h4 span.active-sign').addClass('active');
      } else {
        input.parents('div.frontend-entity').find('h4 span.active-sign').removeClass('active');
      }
    });

    $(".frontend-entity-type, .frontend-entity").collapse({ });

    $("input").trigger("change");
  },
};
