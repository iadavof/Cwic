function CwicLogoClock(options) {
  this.options = $.extend({
    container: 'clock-container',
  }, options || {});

  this.clockContainer = $('#' + this.options.container);

  var lc = this;

  this.hourArm = null;
  this.minuteArm = null;

  $(window).on('resize', function() {lc.createFace();});
  this.createFace();

  setInterval(function(){ lc.setCurrentTime(); }, 30000);
}

CwicLogoClock.prototype.createFace = function() {
  // Remove old face
  this.clockContainer.find('div.face').remove();

  if(this.clockContainer.width() > 300) {
    var radius = this.clockContainer.width() / 10;

    var face = $('<div>', {'class': 'face'});
    face.css({
      position: 'absolute',
      backgroundColor: 'white',
      left: '21.6%',
      top: '50%',
      marginTop: -radius + 'px',
      marginLeft: -radius + 'px',
      borderRadius: radius + 'px',
      zIndex: 5,
      width: 2*radius,
      height: 2*radius,
    });
    
    var faceMiddle = $('<div>').css({
      position: 'absolute',
      borderRadius: '50%',
      width: '11%',
      height: '11%',
      backgroundColor: '#ff3520',
      top: '50%',
      left: '50%',
      '-webkit-transform' : 'translate(-50%, -50%)',
         '-moz-transform' : 'translate(-50%, -50%)',
          '-ms-transform' : 'translate(-50%, -50%)',
           '-o-transform' : 'translate(-50%, -50%)',
              'transform' : 'translate(-50%, -50%)',
                   'zoom' : 1,
    });
    
    faceMiddle.appendTo(face);
    this.clockContainer.append(face);
    this.createArms(face);
  }
}

CwicLogoClock.prototype.createArms = function(face) {
  var face = $(face);

  this.hourArm = $('<div>');
  this.minuteArm = $('<div>');

  var armWidth = face.width()/10;
  var armHeight = face.height()/2.1;

  this.hourArm.css({
    position: 'absolute',
    backgroundColor: '#ff3520',
    height: '46%',
    width: '11%',
    borderRadius: '0 0 1000px 1000px',
    zIndex: 5,
    left: '50%',
    top: '50%',
    '-webkit-transform-origin' : 'center 0',
     '-moz-transform-origin' : 'center 0',
      '-ms-transform-origin' : 'center 0',
       '-o-transform-origin' : 'center 0',
          'transform-origin' : 'center 0',
  });

  this.minuteArm.css({
    position: 'absolute',
    backgroundColor: '#ff3520',
    height: '38%',
    width: '11%',
    borderRadius: '0 0 1000px 1000px',
    zIndex: 5,
    left: '50%',
    top: '50%',
    '-webkit-transform-origin' : 'center 0',
     '-moz-transform-origin' : 'center 0',
      '-ms-transform-origin' : 'center 0',
       '-o-transform-origin' : 'center 0',
          'transform-origin' : 'center 0',
  });

  face.append(this.hourArm);
  face.append(this.minuteArm);
  this.setCurrentTime();
}

CwicLogoClock.prototype.setCurrentTime = function() {
  var now = moment();
  var hour = now.hour();
  var minute = now.minute();

  hourDeg = (((((hour % 12) * 60) + minute) / 720.0) * 360) - 180;
  minuteDeg = ((minute / 60.0) * 360) - 180;

  this.hourArm.css({
  '-webkit-transform' : 'translate(-50%, 0) rotate('+hourDeg+'deg)',
     '-moz-transform' : 'translate(-50%, 0) rotate('+hourDeg+'deg)',
      '-ms-transform' : 'translate(-50%, 0) rotate('+hourDeg+'deg)',
       '-o-transform' : 'translate(-50%, 0) rotate('+hourDeg+'deg)',
          'transform' : 'translate(-50%, 0) rotate('+hourDeg+'deg)',
               'zoom' : 1
    });

  this.minuteArm.css({
  '-webkit-transform' : 'translate(-50%, 0) rotate('+minuteDeg+'deg)',
     '-moz-transform' : 'translate(-50%, 0) rotate('+minuteDeg+'deg)',
      '-ms-transform' : 'translate(-50%, 0) rotate('+minuteDeg+'deg)',
       '-o-transform' : 'translate(-50%, 0) rotate('+minuteDeg+'deg)',
          'transform' : 'translate(-50%, 0) rotate('+minuteDeg+'deg)',
               'zoom' : 1
    });
}
