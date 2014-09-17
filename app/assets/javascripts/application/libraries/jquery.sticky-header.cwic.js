(function($) {
  var cwic_sticky_header = {
    toStick: null,
    stickPosition: null,
    scrollViewport: null,
    nowSticky: false,
    init: function(toStick, stickPosition) {
      this.toStick = toStick;
      this.stickPosition = stickPosition;
      this.scrollViewport = $('#content-area');
      this.addScrollbarWidth();
      this.bindEvents();
    },
    bindEvents: function() {
      var _this = this;
      this.scrollViewport.on('scroll.cwic_sticky', $.throttle(200, function() { _this.stickyOnScroll.call(_this); }));
    },
    stickyOnScroll: function() {
      var viewportOffset = parseFloat(this.scrollViewport.offset().top);
      var toStickOffset = parseFloat(this.toStick.offset().top);
      this[(toStickOffset < viewportOffset) ? 'stick' : 'unStick']();
    },
    stick: function() {
      if(!this.nowSticky) {
        this.toStick.contents().appendTo(this.stickPosition);
        this.nowSticky = true;
      }
    },
    unStick: function() {
      if(this.nowSticky) {
        this.stickPosition.contents().appendTo(this.toStick);
        this.nowSticky = false;
      }
    },
    addScrollbarWidth: function() {
      this.stickPosition.css('marginRight', APP.util.getScrollbarWidth() + 'px');
    }
  };

  $.fn.cwicStickyHeader = function() {
    var elems = $(this).not('.cwic-sticky');
    elems.each(function() {
      var header = $(this);
      var stickDiv = $(header.data('stick-to'));
      cwic_sticky_header.init($(this), stickDiv);
    });
  };
})(jQuery);
