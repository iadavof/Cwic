var current_user, current_organisation;
APP.init = function() {
  // Load current_user and current_organisation data
  var body = $('body');
  current_user = { id: parseInt(body.data('current-user-id')), name: body.data('current-user-name') };
  current_organisation = { id: parseInt(body.data('current-organisation-id')) };

  // Load the menu
  this.global.menuInit();
  this.global.keyboardShortcutsInit();

  // Load the feedback module
  new IADAFeedback({
    open_button_id: 'open-feedback-button',
    backend_url: Routes.feedbacks_path({ format: 'json' })
  });

  // Load stickies (if #note-container is present)
  this.stickies.loadStickies();

  // Set the upper nprogress bar as the default ajax complete and start handlers
  this.global.addProgressbarToAjax();

  // Initialize date- and timepicker fields
  this.global.initializeDateTimePickers();
};

$(document).on('page:fetch',   function() { NProgress.stackPush(); });
$(document).on('page:load',   function() { NProgress.stackPop(); });
$(document).on('page:restore', function() { NProgress.remove(); });

APP.global = {
  menuInit: function() {
    var submenuBox = $('#submenu-box');

    this.slideSubMenuByMenuItem($('#main-menu > li.active').first().attr('id'), false);

    $('#main-menu > li > a').on('click', function() {
      return APP.global.slideSubMenuByMenuItem($(this).parent('li').attr('id'), true);
    });
  },
  addProgressbarToAjax : function() {
    NProgress.configure({ container: $('div#progress-bar-container'), showSpinner: false });

    $(document).ajaxStart(function() {
      NProgress.stackPush();
    });

    $(document).ajaxComplete(function() {
      NProgress.stackPop();
    });
  },
  slideSubMenuByMenuItem: function(htmlId, animated) {
    var submenuBox = $('#submenu-box');
    var menuItem = $('#' + htmlId);
    var relatedSubmenu = $('#submenu-box > .submenu[data-main-menu-relation="' + htmlId + '"]').first();
    var duration = animated ? 250 : 0;

    if($(submenuBox).is(':animated')) {
      return false;
    } else if (!htmlId || relatedSubmenu.length == 0 || menuItem.length == 0) {
      return true;
    } else {
      var menuItems = $('#main-menu > li');
      var submenus = $('#submenu-box > .submenu');

      $(menuItems).children('a').each(function(){
        var shortcutKey = APP.global.getShortcutKeyById($(this).data('shortcutFor'));
        if (shortcutKey) {
          var txt = $(this).text();
          var index = txt.toUpperCase().indexOf(shortcutKey);
          if (index >= 0) {
            $(this).html(txt.substring(0, index) + '<span class="shortcut-highlight">' + txt.substring(index, index + 1) + '</span>' + txt.substring(index + 1));
          }
        }
      });

      if ($(menuItem).hasClass('selected')) { /* Contract expanded submenu */
        $(menuItems).removeClass('selected');
        $(menuItems).children('a').each(function(){
          var shortcutKey = APP.global.getShortcutKeyById($(this).data('shortcutFor'));
          if (shortcutKey) {
            $(this).attr('title', jsLang.strings.expand_menu + ' [Alt+' + shortcutKey + ']');
          }
        });
        $(submenuBox).animate({height: 0}, duration, 'swing', function() {
          $(submenus).removeClass('selected');
        });
      } else {
        $(menuItems).removeClass('selected');
        $(menuItems).children('a').each(function(){
          var shortcutKey = APP.global.getShortcutKeyById($(this).data('shortcutFor'));
          if (shortcutKey) {
            $(this).attr('title', jsLang.strings.expand_menu + ' [Alt+' + shortcutKey + ']');
          }
        });
        $(menuItem).addClass('selected');
        $(menuItem).children('a').each(function(){
          var shortcutKey = APP.global.getShortcutKeyById($(this).data('shortcutFor'));
          if (shortcutKey) {
            $(this).attr('title', jsLang.strings.contract_menu + ' [Alt+' + shortcutKey + ']');
          }
        });
        if ($(submenuBox).height() > 0) { /* Contract expanded submenu first, then expand requested submenu */
          $(submenuBox).animate({height: 0}, duration, 'swing', function() {
            $(submenus).removeClass('selected');
            $(relatedSubmenu).addClass('selected');
            $(submenuBox).animate({height: relatedSubmenu.outerHeight(false)}, duration, 'swing', function() {
              $(this).css({height: 'auto'});
            });
          });
        } else { /* Expand requested submenu */
          $(submenus).removeClass('selected');
          $(relatedSubmenu).addClass('selected');
          $(submenuBox).animate({height: relatedSubmenu.outerHeight(false)}, duration, 'swing', function(){
            $(this).css({height: 'auto'});
          });
        }
      }
      return false;
    }
  },
  keyboardShortcutsInit: function() {
    $(document).keydown(function(event) {
      if(event.altKey) {
        var keyString = String.fromCharCode(event.which);
        $('#main-menu > li > a').each(function(){
          var menuItemId = $(this).parent().attr('id');
          var menuItemShortcutKey = APP.global.getShortcutKeyById($(this).data('shortcutFor'));
          if(keyString == menuItemShortcutKey) {
            return APP.global.executeShortcut(menuItemId);
          }
        });
      }
    });
  },
  executeShortcut: function(htmlId) {
    this.slideSubMenuByMenuItem(htmlId, true);
    return false;
  },
  getShortcutKeyById: function(id) {
    var key = jsLang.shortcutKeys[id.replace(/[^a-zA-Z0-9]/g, '_')];
    if (typeof(key) != 'undefined' && key.length == 1) {
      return key.toUpperCase();
    } else {
      return false;
    }
  },
  initializeDateTimePickers: function(parent) {
    if(!parent) {
      parent = document.body;
    }
    $(parent).find('.datepicker-field').datepicker({ showOn: 'both' });
    $(parent).find('.timepicker-field').timepicker({ showPeriodLabels: false, showOn: 'both' });
    $(document).on('nested:fieldAdded', function() { APP.global.initializeDateTimePickers(this); });
  }
};

function array_to_sentence(array) {
  if(array.length <= 1) {
    return array
  } else {
    return array.slice(0, array.length - 1).join(', ') + " en " + array.slice(-1); // XXX TODO internationalization
  }
}

function format_text(text) {
  if(text == '') {
     return '<em>Geen</em>'; // XXX TODO internationalization
  } else {
    return text;
  }
}

window.log = function ( string ) {
  if ( typeof console == 'object' ) { console.log ( string ) };
}

Date.prototype.customFormat = function(formatString){
    var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
    var dateObject = this;
    YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
    MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
    MMM = $.datepicker._defaults.monthNamesShort[M-1];
    MMMM = $.datepicker._defaults.monthNames[M-1];
    DD = (D=dateObject.getDate())<10?('0'+D):D;
    DDD = $.datepicker._defaults.dayNamesShort[dateObject.getDay()];
    DDDD = $.datepicker._defaults.dayNames[dateObject.getDay()];
    th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
    formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

    h=(hhh=dateObject.getHours());
    if (h==0) h=24;
    if (h>12) h-=12;
    hh = h<10?('0'+h):h;
    AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
    mm=(m=dateObject.getMinutes())<10?('0'+m):m;
    ss=(s=dateObject.getSeconds())<10?('0'+s):s;
    return formatString.replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
}