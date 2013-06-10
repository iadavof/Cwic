$(document).ready(function() {
  menuInit();
});

function menuInit() {
  var submenuBox = $('#submenu-box');
  $(window).on('resize', function() {
    var selectedSubmenu = $('#submenu-box > .submenu.selected').first();
    if (selectedSubmenu) {
      $(submenuBox).css({height: selectedSubmenu.outerHeight(false)});
    }
  });
  
  $(submenuBox).css({height: 0});
  $('#submenu-box > .submenu').hide();
  
  slideSubMenuByMenuItem($('#main-menu > li.active').first().attr('id'), false);
  
  $('#main-menu > li > a').on('click', function() {
    return slideSubMenuByMenuItem($(this).parent('li').attr('id'), true);
  });
}

function slideSubMenuByMenuItem(htmlId, animated) {
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
    
    if ($(menuItem).hasClass('selected')) {
      $(menuItems).removeClass('selected');
      $(submenuBox).animate({height: 0}, duration, 'swing', function() {
        $(submenus).removeClass('selected').hide();
      });
    } else {
      $(menuItems).removeClass('selected');
      $(menuItem).addClass('selected');
      if ($(submenuBox).height() > 0) {
        $(submenuBox).animate({height: 0}, duration, 'swing', function() {
          $(submenus).removeClass('selected').hide();
          $(relatedSubmenu).addClass('selected').show();
          $(submenuBox).animate({height: relatedSubmenu.outerHeight(false)}, duration);
        });
      } else {
        $(submenus).removeClass('selected').hide();
        $(relatedSubmenu).addClass('selected').show();
        $(submenuBox).animate({height: relatedSubmenu.outerHeight(false)}, duration);
      }
    }
    return false;
  }
}