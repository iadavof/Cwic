(function($) {
  var cwic_sticky = {
    init: function(sticky) {
      var container = $('<div class="cwic-sticky-container"></div>');
      sticky.addClass('cwic-sticky').after(container);
      sticky.appendTo(container);
      var substituteContainer = container.clone();
      substituteContainer.insertAfter(container).hide();
      cwic_sticky.bindEvents(container, substituteContainer);
    },
    bindEvents: function(container, substituteContainer) {
      $('#content-area').on('scroll.cwic_sticky', function(e) {
        var viewportOffset = parseFloat($(this).offset().top);
        var containerOffset = parseFloat(container.offset().top);
        var substituteContainerOffset = parseFloat(substituteContainer.offset().top);
        if (substituteContainer.css('display') == 'none' && (containerOffset < viewportOffset)) {
           cwic_sticky.makeSticky(container, substituteContainer);
        }
        if (substituteContainer.css('display') != 'none' && substituteContainerOffset >= viewportOffset) {
          cwic_sticky.destroySticky(container, substituteContainer);
        }
      });
      $(window).on('resize.cwic_sticky header-animated.cwic_sticky', function(e) {
        cwic_sticky.updateCss(container, substituteContainer);
      });
      $(window).on('header-start-animation.cwic_sticky', function(e) {
        if (substituteContainer.css('display') != 'none') {
          container.css({visibility: 'hidden'});
        }
      });
      $(window).on('header-animated.cwic_sticky', function(e) {
        container.css({visibility: 'visible'});
      });
      $(document).on('page:before-change.cwic_sticky', function() {
        cwic_sticky.destroySticky(container, substituteContainer);
      });
      $(window).on('beforeunload.cwic_sticky', function() {
        cwic_sticky.destroySticky(container, substituteContainer);
      });
    },
    makeSticky: function(container, substituteContainer) {
      container.data('style', container.attr('style'));
      substituteContainer.attr('style', container.attr('style')).css({display: '', visibility: 'hidden'});
      cwic_sticky.updateCss(container, substituteContainer);
    },
    destroySticky: function(container, substituteContainer) {
      container.attr('style', container.data('style'));
      substituteContainer.hide();
    },
    updateCss: function(container, substituteContainer) {
      if (substituteContainer.css('display') != 'none') {
        container.css({position: 'fixed', marginLeft: 0, width: substituteContainer.width(), left: substituteContainer.offset().left + 'px', top: parseInt($('#content-area').offset().top) + 'px'});
      }
    },
  };
  
  $.fn.extend({
    cwicSticky: function() {
      var elems = $(this).not('.cwic-sticky');
      elems.each(function() {
        cwic_sticky.init($(this));
      });
    },
  });
})(jQuery);