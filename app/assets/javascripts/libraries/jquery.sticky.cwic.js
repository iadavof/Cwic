(function($) {
  var cwic_sticky = {
    init: function(sticky) {
      var container = $('<div class="cwic-sticky-container"></div>');
      sticky.after(container);
      sticky.appendTo(container);
      var substituteContainer = $('<div class="cwic-sticky-container clone"></div>');
      substituteContainer.insertAfter(container).hide();
      cwic_sticky.bindEvents(container, substituteContainer);
    },
    bindEvents: function(container, substituteContainer) {
      $('#content-area').on('scroll.cwic_sticky', function(e) {
        var headerHeight = parseFloat($('#header').outerHeight(true));
        var containerOffset = parseFloat(container.offset().top);
        var substituteContainerOffset = parseFloat(substituteContainer.offset().top);
        if (substituteContainer.css('display') == 'none' && (containerOffset < headerHeight)) {
           cwic_sticky.makeSticky(container, substituteContainer);
        }
        if (substituteContainer.css('display') != 'none' && substituteContainerOffset >= headerHeight) {
          cwic_sticky.destroySticky(container, substituteContainer);
        }
      });
      $(window).on('resize.cwic_sticky header-animated.cwic_sticky', function(e) {
        cwic_sticky.updateCss(container, substituteContainer);
      });
      $(window).on('header-start-animation', function(e) {
        container.css({visibility: 'hidden'});
      });
      $(window).on('header-animated', function(e) {
        container.css({visibility: 'visible'});
      });
    },
    makeSticky: function(container, substituteContainer) {
      substituteContainer.css({display: 'block'}).attr('style', container.attr('style'));
      cwic_sticky.updateCss(container, substituteContainer);
    },
    destroySticky: function(container, substituteContainer) {
      container.removeAttr('style').attr('style', substituteContainer.attr('style')).css({height: ''});
      substituteContainer.hide();
    },
    updateCss: function(container, substituteContainer) {
      if (substituteContainer.css('display') != 'none') {
        substituteContainer.css({height: container.height() + 'px'});
        container.css({position: 'fixed', marginLeft: 0, width: substituteContainer.width(), left: substituteContainer.offset().left + 'px', top: $('#header').outerHeight(true) + 'px'});
      }
    },
  };
  
  $.fn.extend({
    cwicSticky: function() {
      var elems = $(this);
      elems.each(function() {
        cwic_sticky.init($(this));
      });
    },
  });
})(jQuery);