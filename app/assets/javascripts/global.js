$(document).ready(function() {
  $(window).on('resize', function() {
    var selectedSubmenu = $('#submenu-box > .submenu.selected');
    $('#submenu-box').css({height: selectedSubmenu.outerHeight(false)});
  });
  $('#submenu-box').css({height: 0});
  $('#submenu-box > .submenu').hide();
  $('#main-menu > li > a').on('click', function() {
    var parent = $(this).parent('li');
    var relatedSubmenu = $('#submenu-box > .submenu[data-main-menu-relation="' + $(parent).attr('id') + '"]');
    if (relatedSubmenu.length > 0) {
      if (!$(parent).hasClass('selected')) {
        $('#main-menu > li.selected').removeClass('selected');
        $(parent).addClass('selected');
        if ($('#submenu-box').height() > 0) {
          $('#submenu-box').animate({height: 0}, 300, 'swing', function() {
            $('#submenu-box > .submenu.selected').removeClass('selected').hide();
            $('#submenu-box > .submenu[data-main-menu-relation="' + $(parent).attr('id') + '"]').addClass('selected').show();
            $('#submenu-box').animate({height: relatedSubmenu.outerHeight(false)}, 300);
          });
        } else {
          $('#submenu-box > .submenu.selected').removeClass('selected').hide();
          $('#submenu-box > .submenu[data-main-menu-relation="' + $(parent).attr('id') + '"]').addClass('selected').show();
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
  });
});