function CwicLocalMenu(menu, options) {
  this.options = $.extend({
    divisions: { navigation: 'local_menu_navigation', context: 'local_menu_context', page: 'local_menu_page' },
    default_division: 'context',
  }, options || {});

  this.menu = $(menu);
  this.divisionDoms = {};

  this.init();
}

CwicLocalMenu.prototype.init = function() {
  var _this = this;

  this.options.divisions.each(function(key, value){
    this.divisionDoms[key] = _this.menu.find('.' + value);
  });

};

CwicLocalMenu.prototype.addButton = function(division, content) {
  division = division || this.options.default_division;

  if($.inArray(division, APP.util.array_keys(this.divisionDoms)) > -1) {

    var newButton = $('<a>', { 'class': 'button', html: content });

    this.divisionDoms[division].append(newButton);

    return newButton;
  }
};

CwicLocalMenu.prototype.isDivision = function(division) {
  return $.inArray(division, APP.util.array_keys(this.divisionDoms)) > -1;
};

CwicLocalMenu.prototype.removeButton = function(division, content) {
  division = division || this.options.default_division;

  if(this.isDivision(division)) {

    var newButton = $('<a>', { 'class': 'button', html: content });

    this.divisionDoms[division].append(newButton);

    return newButton;
  }
};

CwicLocalMenu.prototype.clearDivision = function(division) {
  if(this.isDivision) {
    this.divisionDoms[division].html('');
  }
};

CwicLocalMenu.prototype.clearAllDivisions = function() {
  $(this.divisionDoms).each(function(){
    this.html('');
  });
};
