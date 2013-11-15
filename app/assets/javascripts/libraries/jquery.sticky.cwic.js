(function($) {
  var cwic_sticky = {
    init: function(sticky) {
      var container = $('<div class="cwic-sticky-container"></div>');
      sticky.after(container);
      sticky.appendTo(container);
      var stickyContainer = container.clone();
      stickyContainer.insertAfter(container).css({position: 'fixed', marginLeft: 0, width: container.outerWidth(false), left: container.offset().left + 'px', top: $('#header').outerHeight(true) + 'px'}).hide().addClass('clone');
      cwic_sticky.bindEvents(container, stickyContainer);
    },
    bindEvents: function(container, stickyContainer) {
      $('#content-area').on('scroll.cwic_sticky', function(e) {
        var headerHeight = parseFloat($('#header').outerHeight(true));
        var containerOffset = parseFloat(container.offset().top);
        if (stickyContainer.css('display') == 'none' && (containerOffset < headerHeight)) {
           cwic_sticky.makeSticky(container, stickyContainer);
        }
        if (stickyContainer.css('display') != 'none' && containerOffset >= headerHeight) {
          cwic_sticky.destroySticky(container, stickyContainer);
        }
      });
      $(window).on('resize.cwic_sticky header-animated.cwic_sticky', function(e) {
        cwic_sticky.updateCss(container, stickyContainer);
      });
    },
    makeSticky: function(container, stickyContainer) {
      container.css({visibility: 'hidden'});
      cwic_sticky.updateCss(container, stickyContainer);
      stickyContainer.show();
    },
    destroySticky: function(container, stickyContainer) {
      container.css({visibility: 'visible'});
      stickyContainer.hide();
    },
    updateCss: function(container, stickyContainer) {
      stickyContainer.css({marginLeft: 0, width: container.outerWidth(false) + 'px', left: container.offset().left + 'px', top: $('#header').outerHeight(true) + 'px'});
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