function IADAlogoClock(options) {
  this.options = Object.extend({
    container: 'clock-container',
  }, options || {});

  this.clockContainer = $('#' + this.options.container);

  var lc = this;

  $(window).on('resize', function() {lc.createFace();});
  this.createFace();

  this.hourArm = null;
  this.minuteArm = null;


  setInterval(function(){ lc.setCurrentTime(); }, 30000);
}

IADAlogoClock.prototype.createFace = function() {
  // remove old face
  this.clockContainer.find('div.face').remove();

  if(this.clockContainer.width() > 300) {
    var radius = this.clockContainer.width() / 10;

    var face = $('<div>', {class: 'face'});
    face.css({
      position: 'absolute',
      backgroundColor: 'white',
      left: '21.5%',
      top: '48%',
      marginTop: -radius + 'px',
      marginLeft: -radius + 'px',
      borderRadius: radius + 'px',
      zIndex: 5,
      width: 2*radius,
      height: 2*radius,
    });

    this.clockContainer.append(face);
    this.createArms(face);
  }
}

IADAlogoClock.prototype.createArms = function(face) {
  var face = $(face);

  this.hourArm = $('<div>');
  this.minuteArm = $('<div>');

  var armWidth = face.width()/10;
  var armHeight = face.height()/2.1;

  this.hourArm.css({
    position: 'absolute',
    backgroundColor: '#FE2035',
    height: armHeight/1.5,
    width: armWidth,
    marginLeft: -armWidth/2 + 'px',
    marginTop: -armHeight/20,
    borderRadius: armWidth/2 + 'px',
    zIndex: 5,
    left: '50%',
    top: '50%',
    '-webkit-transform-origin' : 'center 5%',
     '-moz-transform-origin' : 'center 5%',
      '-ms-transform-origin' : 'center 5%',
       '-o-transform-origin' : 'center 5%',
          'transform-origin' : 'center 5%',
  });

  this.minuteArm.css({
    position: 'absolute',
    backgroundColor: '#FE2035',
    height: armHeight,
    width: armWidth,
    marginLeft: -armWidth/2 + 'px',
    marginTop: -armHeight/20,
    borderRadius: armWidth/2 + 'px',
    zIndex: 5,
    left: '50%',
    top: '50%',
    '-webkit-transform-origin' : 'center 5%',
     '-moz-transform-origin' : 'center 5%',
      '-ms-transform-origin' : 'center 5%',
       '-o-transform-origin' : 'center 5%',
          'transform-origin' : 'center 5%',
  });

  face.append(this.hourArm);
  face.append(this.minuteArm);
  this.setCurrentTime();
}

IADAlogoClock.prototype.setCurrentTime = function() {
  var now = moment();
  var hour = now.hour();
  var minute = now.minute();

  hourDeg = (((((hour % 12) * 60) + minute) / 720.0) * 360) - 180;
  minuteDeg = ((minute / 60.0) * 360) - 180;

  this.hourArm.css({
  '-webkit-transform' : 'rotate('+hourDeg+'deg)',
     '-moz-transform' : 'rotate('+hourDeg+'deg)',
      '-ms-transform' : 'rotate('+hourDeg+'deg)',
       '-o-transform' : 'rotate('+hourDeg+'deg)',
          'transform' : 'rotate('+hourDeg+'deg)',
               'zoom' : 1
    });

  this.minuteArm.css({
  '-webkit-transform' : 'rotate('+minuteDeg+'deg)',
     '-moz-transform' : 'rotate('+minuteDeg+'deg)',
      '-ms-transform' : 'rotate('+minuteDeg+'deg)',
       '-o-transform' : 'rotate('+minuteDeg+'deg)',
          'transform' : 'rotate('+minuteDeg+'deg)',
               'zoom' : 1
    });

}