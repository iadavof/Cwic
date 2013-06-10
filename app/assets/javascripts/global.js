$(document).ready(function() {
  $(window).on('resize', function() {
    var selectedSubmenu = $('#submenu-box > .submenu.selected').first();
    $('#submenu-box').css({height: selectedSubmenu.outerHeight(false)});
  });
  
  $('#submenu-box').css({height: 0});
  $('#submenu-box > .submenu').hide();
  
  slideSubMenuByMenuItem($('#main-menu > li.active').first().attr('id'), false);
  
  $('#main-menu > li > a').on('click', function() {
    return slideSubMenuByMenuItem($(this).parent('li').attr('id'), true);
  });
});

function slideSubMenuByMenuItem(htmlId, animated) {
  var menuItem = $('#' + htmlId);
  var relatedSubmenu = $('#submenu-box > .submenu[data-main-menu-relation="' + htmlId + '"]').first();
  var duration = animated ? 300 : 0;
  
  if (relatedSubmenu.length == 0) {
    return true;
  } else {
    if ($(menuItem).hasClass('selected')) {
      $('#main-menu > li.selected').removeClass('selected');
      $('#submenu-box').animate({height: 0}, duration, 'swing', function() {
        $('#submenu-box > .submenu').removeClass('selected').hide();
      });
    } else {
      $('#main-menu > li.selected').removeClass('selected');
      $(menuItem).addClass('selected');
      if ($('#submenu-box').height() > 0) {
        $('#submenu-box').animate({height: 0}, duration, 'swing', function() {
          $('#submenu-box > .submenu').removeClass('selected').hide();
          $(relatedSubmenu).addClass('selected').show();
          $('#submenu-box').animate({height: relatedSubmenu.outerHeight(false)}, duration);
        });
      } else {
        $('#submenu-box > .submenu').removeClass('selected').hide();
        $(relatedSubmenu).addClass('selected').show();
        $('#submenu-box').animate({height: relatedSubmenu.outerHeight(false)}, duration);
      }
    }
    return false;
  }
}

/*
    var relatedSubmenu = $('#submenu-box > .submenu[data-main-menu-relation="' + $(parent).attr('id') + '"]');
    if (relatedSubmenu.length > 0) {
      if (!$(parent).hasClass('selected')) {
        $('#main-menu > li.selected').removeClass('selected');
        $(parent).addClass('selected');
        if ($('#submenu-box').height() > 0) {
          $('#submenu-box').animate({height: 0}, 300, 'swing', function() {
            $('#submenu-box > .submenu.selected').removeClass('selected').hide();
            $(relatedSubmenu).addClass('selected').show();
            $('#submenu-box').animate({height: relatedSubmenu.outerHeight(false)}, 300);
          });
        } else {
          $('#submenu-box > .submenu.selected').removeClass('selected').hide();
          $(relatedSubmenu).addClass('selected').show();
          $('#submenu-box').animate({height: relatedSubmenu.outerHeight(false)}, 300);
        }
      } else {
        $(parent).removeClass('selected');
        if ($('#submenu-box').height() > 0) {
          $('#submenu-box').animate({height: 0}, 300, 'swing', function() {
            $('#submenu-box > .submenu.selected').removeClass('selected').hide();
          });
        } else {
          $('#submenu-box > .submenu.selected').removeClass('selected').hide();
        }
      }
      return false;
    }
*/