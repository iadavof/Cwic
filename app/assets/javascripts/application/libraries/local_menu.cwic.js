function CwicLocalMenu(menu, options) {
  this.options = $.extend({
    divisions: {
      navigation: 'navigation-actions',
      context: 'context-actions',
      page: 'page-actions'
    },
  }, options || {});

  this.menu = $(menu);
  this.divisionDoms = {};

  this.init();
}

CwicLocalMenu.prototype.init = function() {
  var _this = this;

  $.each(this.options.divisions,
    function(key, value){
      _this.divisionDoms[key] = _this.menu.find('.' + value);
    }
  );

  this.bindOnResize();
};

CwicLocalMenu.prototype.bindOnResize = function() {
  var _this = this;
  this.updateHeightSettings();
  $(window).on('resize', function(){ _this.updateHeightSettings.call(_this); });
};

CwicLocalMenu.prototype.addButton = function(division, id, content, weight) {
  weight = weight || 0;

  if($.inArray(division, APP.util.arrayKeys(this.divisionDoms)) > -1) {
  
    if (this.divisionDoms[division].find('> .inner').length < 1) {
      this.divisionDoms[division].append('<div class="inner">');
    }

    var newButton = $('<a>', { 'class': 'button', html: content, id: id });
    newButton.data('weight', weight);
    var added = false;
    this.divisionDoms[division].find('> .inner').children().each(
      function(){
        var current = $(this);
        var currentWeightData = typeof current.data('weight') == 'undefined' ? 0 : current.data('weight');
        if(parseInt(currentWeightData, 10) > weight) {
          current.before(newButton);
          added = true;
          return false;
        }
      }
    );

    if(!added) {
      this.divisionDoms[division].find('> .inner').append(newButton);
    }

    // Update the height
    this.updateHeightSettings();
    
    // Update UI dimensions
    APP.global.contentAreaResize();

    return newButton;
  }
};

CwicLocalMenu.prototype.getDivision = function(division) {
  if(this.isDivision(division)) {
    return this.divisionDoms[division].find('> .inner');
  }
};

CwicLocalMenu.prototype.getButton = function(buttonid) {
  return this.menu.find('#' + buttonid);
};

CwicLocalMenu.prototype.updateHeightSettings = function() {
  var maxHeight = 0;
  $.each(this.divisionDoms,
    function(){
      $(this).css({height: ''});
      maxHeight = Math.max(maxHeight, $(this).height());
    }
  );
  $.each(this.divisionDoms,
    function(){
      $(this).css({height: maxHeight + 'px'});
    }
  );
};

CwicLocalMenu.prototype.isDivision = function(division) {
  return $.inArray(division, APP.util.arrayKeys(this.divisionDoms)) > -1;
};

CwicLocalMenu.prototype.removeButton = function(division, id) {
  this.divisionDoms[division].find('> .inner a#' . id);

  // Update the height
  this.updateHeightSettings();
  
  // Update UI dimensions
  APP.global.contentAreaResize();
};

CwicLocalMenu.prototype.clearDivision = function(division) {
  if(this.isDivision(division)) {
    this.divisionDoms[division].html('');
  }

  // Update the height
  this.updateHeightSettings();
  
  // Update UI dimensions
  APP.global.contentAreaResize();
};

CwicLocalMenu.prototype.toggleButtons = function(division, buttonids, newState) {
  if(!this.isDivision(division)) {
    return;
  }

  if(!$.isArray(buttonids)) {
    buttonids = [buttonids];
  }

  for(buttonidi in buttonids) {
    var buttonid = buttonids[buttonidi];
    this.divisionDoms[division].find('> .inner #' + buttonid)[newState ? 'show' : 'hide']();
  }

  // Update the height
  this.updateHeightSettings();
  
  // Update UI dimensions
  APP.global.contentAreaResize();
};

CwicLocalMenu.prototype.clearAllDivisions = function() {
  $.each(this.divisionDoms,
    function(){
      $(this).html('');
    }
  );

  // Update the height
  this.updateHeightSettings();
  
  // Update UI dimensions
  APP.global.contentAreaResize();
};

// Get the weight of the utmost left item
CwicLocalMenu.prototype.getWeightMin = function(division) {
  if(this.isDivision(division)) {
    var mostLeft = this.divisionDoms[division].find('> .inner').children().first();
    mostLeftWeight = typeof mostLeft.data('weight') == 'undefined' ? 0 : mostLeft.data('weight');
    return mostLeftWeight;
  }
};

// Get the weight of the utmost right item
CwicLocalMenu.prototype.getWeightMax = function(division) {
  if(this.isDivision(division)) {
    var mostRight = this.divisionDoms[division].find('> .inner').children().last();
    mostRightWeight = typeof mostRight.data('weight') == 'undefined' ? 0 : mostRight.data('weight');
    return mostRightWeight;
  }
};
