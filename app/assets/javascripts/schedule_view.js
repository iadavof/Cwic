APP.schedule_view = {
  init: function() {
    var dateOptions = { showOn: 'both' };
    var timeOptions = { showPeriodLabels: false, showOn: 'both' };
    $('#begins_at_date').datepicker(dateOptions);
    $('#begins_at_time').timepicker(timeOptions);
    $('#ends_at_date').datepicker(dateOptions);
    $('#ends_at_time').timepicker(timeOptions);
  },
};

Object.extend = function(destination, source) {
    for(var property in source) {
        if(source.hasOwnProperty(property)) {
            if( destination[property] != null && typeof destination[property] == 'object') {
              destination[property] = Object.extend(destination[property], source[property])
            } else {
              destination[property] = source[property];
            }
        }
    }
    return destination;
};


IADAscheduleView.prototype.scheduleContainer = null;
IADAscheduleView.prototype.scheduleObjects = null;
IADAscheduleView.prototype.selectedEntities = [];
IADAscheduleView.prototype.options = null;
IADAscheduleView.prototype.beginDate = null;
IADAscheduleView.prototype.endDate = null;

IADAscheduleView.prototype.needleTimeout = null;


function IADAscheduleView(options) {

    this.options = Object.extend({
        container: 'schedule-container',
        backend_url: 'url to backend',
    }, options || {});

    this.initScheduleStub();

    this.createEntityShowCase();
    this.bindControls();
    this.createSchedule();
    this.addTimeAxis();

}

IADAscheduleView.prototype.initScheduleStub = function() {
    var week = this.startAndEndOfWeek();
    this.beginDate = week[0];
    this.endDate = week[1];
    this.scheduleContainer = $('#' + this.options.container);
    this.scheduleContainer.append(this.getTemplateClone('scheduleContainerTemplate').contents());
    this.scheduleContainer.addClass('schedule-container');
    this.createSchedule();
    this.disabledOverlay();
}

IADAscheduleView.prototype.toggleEntity = function (entity_button) {
    if($(entity_button).hasClass('active')) {
        $(entity_button).removeClass('active');
        this.selectedEntities.splice( $.inArray($(entity_button).attr('id').split('_')[1], this.selectedEntities), 1 );
    } else {
        $(entity_button).addClass('active');
        this.selectedEntities.push($(entity_button).attr('id').split('_')[1]);
    }
    this.updateSchedule();
}

IADAscheduleView.prototype.toggleEntities = function (on) {
    schedule = this;
    if(on) {
        this.scheduleContainer.find('.entity-container .entity-button').addClass('active');
        this.scheduleContainer.find('.entity-container .entity-button').each(function() {
            schedule.selectedEntities.push(this.id.split('_')[1]);
        });
    } else {
        this.scheduleContainer.find('.entity-container .entity-button').removeClass('active');
        this.selectedEntities = [];
    }
    this.updateSchedule();
}

IADAscheduleView.prototype.createEntityShowCase = function() {
    var schedule = this;

    this.scheduleContainer.find('.entity-container a#selectAll').on('click', function(e){e.preventDefault(); schedule.toggleEntities(true); return false;});
    this.scheduleContainer.find('.entity-container a#selectNone').on('click', function(e){e.preventDefault(); schedule.toggleEntities(false); return false;});

    $.ajax({
        type: 'POST',
        url: this.options.backend_url  + '/entities',
        data: {

        }
    }).success(function(response) {
        schedule.afterEntitiesLoad(response);
    });
};

IADAscheduleView.prototype.bindControls = function() {
    var schedule = this;
    this.scheduleContainer.find('#scheduleBeginDate').datepicker({showOn: 'both', altField: '#backendBeginDate', altFormat: 'yy-mm-dd'}).datepicker("setDate", new Date(this.beginDate));
    this.scheduleContainer.find('#scheduleEndDate').datepicker({showOn: 'both', altField: '#backendEndDate', altFormat: 'yy-mm-dd'}).datepicker("setDate", new Date(this.endDate));
    this.scheduleContainer.find('#scheduleDateUpdate').click(function(){schedule.setDateDomain();});

    var navigation = this.scheduleContainer.find('.control-container.navigate');
    navigation.find('.button').on('click', function () {
        var beginEnd = null;
        var begin_date = Date.parse(schedule.beginDate);
        if(this.id == 'prevWeek') {
            beginEnd = schedule.startAndEndOfWeek(new Date(begin_date - 7 * 24 * 3600000));
        }
        if(this.id == 'currWeek') {
            beginEnd = schedule.startAndEndOfWeek();
        }
        if(this.id == 'nextWeek') {
            beginEnd = schedule.startAndEndOfWeek(new Date(begin_date + 7 * 24 * 3600000));
        }
        if(this.id == 'prevMonth') {
            beginEnd = schedule.startAndEndOfMonth(new Date(begin_date), -1);
        }
        if(this.id == 'currMonth') {
            beginEnd = schedule.startAndEndOfMonth(new Date(), 0);
        }
        if(this.id == 'nextMonth') {
            beginEnd = schedule.startAndEndOfMonth(new Date(begin_date), 1);
        }

        if(beginEnd != null) {
            schedule.beginDate = beginEnd[0];
            schedule.endDate = beginEnd[1];
            schedule.updateDateDomainControl();
            schedule.updateSchedule();
        }
    });

    this.bindNewReservationControls();
}

IADAscheduleView.prototype.updateDateDomainControl = function() {
    this.scheduleContainer.find('#scheduleBeginDate').datepicker("setDate", new Date(this.beginDate));
    this.scheduleContainer.find('#scheduleEndDate').datepicker("setDate", new Date(this.endDate));
}

IADAscheduleView.prototype.bindNewReservationControls = function() {
    var newScheduleItem = null;
    var newItem = {};
    var scheduleview = this;
    this.scheduleContainer.find('.schedule-body').on('mousedown', '.day-row-schedule-object-item-parts', function(event) {
        if(newScheduleItem == null) {
            newScheduleItem = scheduleview.getTemplateClone('scheduleItemTemplate');
            var offset = $(this).offset();
            var relX = event.pageX - offset.left;
            newItem.end_date = newItem.begin_date = new Date(parseInt($(this).closest('.day-row').attr('id')));
            newItem.schedule_object_id = parseInt(event.target.id.split('_')[1]);
            newItem.end_time = newItem.begin_time = scheduleview.nearestTimePoint(relX, $(this).width());
            newScheduleItem.css('left', + scheduleview.dayTimeToPercentage(newItem.begin_time) + '%');
            $(this).append(newScheduleItem);
        }
    });

    this.scheduleContainer.find('.schedule-body').on('mousemove', '.day-row-schedule-object-item-parts', function(event) {
        var offset = $(this).offset();
        var relX = event.pageX - offset.left;
        if(newScheduleItem != null) {
            newItem.end_time = scheduleview.nearestTimePoint(relX, $(this).width());
            newScheduleItem.css('width', + scheduleview.dayTimePercentageSpan(newItem.begin_time, newItem.end_time) + '%');
        }
    });
    this.scheduleContainer.find('.schedule-body').on('mouseup', function() {
        //handle new entry
        if(newScheduleItem != null && newItem.begin_time < newItem.end_time) {
            schedule.setNewReservationForm(newItem);
            window.location.hash = '#new_reservation';
            $('#new_reservation_popup').find('a.close').on('click', function() {
                if(newScheduleItem != null) {
                    newScheduleItem.remove();
                    newScheduleItem = null;
                }
            });
        } else {
            if(newScheduleItem != null) {
                newScheduleItem.remove();
                newScheduleItem = null;
            }
        }
    });
}

IADAscheduleView.prototype.setNewReservationForm = function(item) {
    var reservationForm = $('#new_reservation_popup');
    reservationForm.find('input#begins_at_date').datepicker("setDate", item.begin_date);
    reservationForm.find('input#ends_at_date').datepicker("setDate", item.end_date);
    reservationForm.find('input#begins_at_time').timepicker("setTime", item.begin_time);
    reservationForm.find('input#ends_at_time').timepicker("setTime", item.end_time);
    reservationForm.find('select#reservation_entity_id').val(item.schedule_object_id);
}

IADAscheduleView.prototype.nearestTimePoint = function(relX, parentWidth) {
    var steps = 48; // half hour steps
    var step = parentWidth / steps;
    var fullsteps = Math.round(relX / step);
    var stepMinutes = 24 * 60 / steps;
    var nearestTimeMinutes = fullsteps * stepMinutes;
    return ((Math.floor(nearestTimeMinutes / 60) < 10) ? '0' : '') + Math.floor(nearestTimeMinutes / 60) + ':' + ((Math.floor(nearestTimeMinutes % 60) < 10) ? '0' : '') + nearestTimeMinutes % 60;
}

IADAscheduleView.prototype.setDateDomain = function() {
    this.beginDate = $(this.scheduleContainer).find('#backendBeginDate').val();
    this.endDate = $(this.scheduleContainer).find('#backendEndDate').val();
    this.updateSchedule();
}

IADAscheduleView.prototype.afterEntitiesLoad = function(response) {

    this.entities = response.entities;
    for(var entnr in response.entities) {
        var entity = response.entities[entnr];
        var jentity = this.getTemplateClone('entityButtonTemplate');
        jentity.attr('id', 'entity_'+ entity.id);
        jentity.find('.entity-name').text(entity.name);
        jentity.find('img.entity-icon').attr('src', entity.icon).css('border-color', entity.color);
        if(entity.selected) {
            this.selectedEntities.push(entity.id);
            jentity.addClass('active');
        }

        var schedule = this;
        jentity.on('click', function() {schedule.toggleEntity(this);});

        $(this.scheduleContainer).find('.entity-container').append(jentity);
    }
}

IADAscheduleView.prototype.addTimeAxis = function() {
    var timeAxis = $(this.scheduleContainer).find('.time-axis')

    for(var i = 1; i < 24; i += 1) {
        var hourpart = this.getTemplateClone('hourTimeAxisFrameTemplate');
        $(hourpart).attr('id', 'hour_'+ i).find('p.time').text(i);
        $(timeAxis).append(hourpart);
    }

    timeAxis.sticky({getWidthFrom: '.schedule-body'});
}

IADAscheduleView.prototype.createSchedule = function() {
    var days = this.getDatesBetween(Date.parse(this.beginDate), Date.parse(this.endDate));

    for(var daynr in days) {
        this.appendDay(days[daynr]);
        if(days[daynr].date == new Date().setHours(0,0,0,0)) {
            this.showCurrentDayTimeNeedle();
        }
    }
    this.scheduleContainer.find('.schedule-body').css('height', 'auto');

}

IADAscheduleView.prototype.loadScheduleObjects = function() {
    if(this.selectedEntities.length > 0) {
        schedule = this;

        $.ajax({
            type: 'POST',
            url: this.options.backend_url  + '/index_domain',
            data: {
                entity_ids: this.selectedEntities.join(','),
                schedule_begin: this.beginDate,
                schedule_end: this.endDate,
            }
        }).success(function(response) {
            schedule.afterScheduleObjectsLoad(response);
        });
    }
}

IADAscheduleView.prototype.clearSchedule = function() {
    if(this.needleTimeout != null) {
       clearTimeout(this.needleTimeout);
    }
    var scheduleBody = this.scheduleContainer.find('.schedule-body');
    scheduleBody.css('height', scheduleBody.height());
    scheduleBody.html('');
    this.scheduleContainer.find('.day-axis').html('');
}

IADAscheduleView.prototype.updateSchedule = function() {
    this.clearSchedule();
    if(this.selectedEntities.length > 0) {
        this.loadScheduleObjects();
        this.scheduleContainer.find('.schedule-body .disabled-overlay').remove();
    } else {
        this.createSchedule();
        this.disabledOverlay();
    }
}

IADAscheduleView.prototype.disabledOverlay = function() {
    this.scheduleContainer.find('.schedule-body').append($('<div></div>', {class: 'disabled-overlay', text: 'Geen objecten geselecteerd.'})); //I18n T TODO
}

IADAscheduleView.prototype.afterScheduleObjectsLoad = function(response) {
    this.scheduleObjects = response.schedule_objects;
    this.beginDate = response.begin_date;
    this.endDate = response.end_date;

    this.createSchedule();
    this.initDayRowScheduleObjectRows();
    this.addAllScheduleItems();
}

IADAscheduleView.prototype.initDayRowScheduleObjectRows = function() {
    for(var schi in this.scheduleObjects) {
        var schobject = this.scheduleObjects[schi];
        var newSchObjItemParts = this.getTemplateClone('dayRowScheduleObjectItemPartsTemplate');
        newSchObjItemParts.attr('id', 'scheduleObject_' + schobject.schedule_object_id);
        newSchObjItemParts.find('p.name').text(schobject.schedule_object_name);
        $(this.scheduleContainer).find('.day-row .day-row-schedule-objects').append(newSchObjItemParts);
    }
    if(this.scheduleObjects != null) {
        if(this.scheduleObjects.length == 1) {
            $('.day-row-schedule-object-item-parts').css('height', '60px');
        } else if(this.scheduleObjects.length == 2) {
            $('.day-row-schedule-object-item-parts').css('height', '30px');
        } else {
            $('.day-row-schedule-object-item-parts').css('height', '20px');
            $('.day-axis .day-axis-row').height($('.day-row').outerHeight());
        }
    }
}

IADAscheduleView.prototype.addAllScheduleItems = function() {
    for(var schoi in this.scheduleObjects) {
        var schobject = this.scheduleObjects[schoi];
        for(var schi in schobject.items) {
            this.addScheduleItem(schobject.items[schi], schobject.schedule_object_id);
        }
    }
}

IADAscheduleView.prototype.addScheduleItem = function(item, schedule_object_id) {
    if(item.begin_date == item.end_date) {
        var beginDate = this.dateToFirstMSec(item.begin_date);
        this.addSingleDayItem($(this.scheduleContainer).find('#'+ beginDate), item, schedule_object_id);
    } else {
        var beginDate = this.dateToFirstMSec(item.begin_date);
        var endDate = this.dateToFirstMSec(item.end_date);
        var days = this.getDatesBetween(beginDate, endDate);
        for(var dayi = 0; dayi < days.length; dayi += 1) {
            switch(dayi) {
                case 0:
                    var schedulePart = this.addSingleDayBlock($(this.scheduleContainer).find('#'+ days[dayi].date), item.begin_time, '24:00', item, schedule_object_id);
                    schedulePart.find('div.continue.right').show();
                    break;
                case days.length - 1:
                    var schedulePart = this.addSingleDayBlock($(this.scheduleContainer).find('#'+ days[dayi].date), '00:00', item.end_time, item, schedule_object_id);
                    schedulePart.find('div.continue.left').show();
                    break;
                default:
                    var schedulePart = this.addSingleDayBlock($(this.scheduleContainer).find('#'+ days[dayi].date), '00:00', '24:00', item, schedule_object_id);
                    schedulePart.find('div.continue').show();
            }
        }
    }
}

IADAscheduleView.prototype.dateToFirstMSec = function (date) {
    var ret = new Date(Date.parse(date));
    ret.setHours(0,0,0,0);
    ret = new Date(ret).getTime();
    return ret;
}

IADAscheduleView.prototype.addSingleDayBlock = function(dayRowScheduleRow, begin_time, end_time, item, schedule_object_id) {
    var newScheduleItem = this.getTemplateClone('scheduleItemTemplate');
    newScheduleItem.css('left', + this.dayTimeToPercentage(begin_time) + '%');
    newScheduleItem.css('width', + this.dayTimePercentageSpan(begin_time, end_time) + '%');
    newScheduleItem.css('background-color', item.bg_color);
    newScheduleItem.css('color', item.text_color);
    newScheduleItem.find('p.item-text').text(item.description);
    newScheduleItem.find('p.item-text').attr('title', item.description);
    $(dayRowScheduleRow).find('#scheduleObject_' + schedule_object_id).append(newScheduleItem);
    return newScheduleItem;
}

IADAscheduleView.prototype.addSingleDayItem = function(dayRowScheduleRow, item, schedule_object_id) {
    this.addSingleDayBlock(dayRowScheduleRow, item.begin_time, item.end_time, item, schedule_object_id);
}

IADAscheduleView.prototype.dayTimePercentageSpan = function(begintime, endtime) {
    var hours = parseInt(endtime.split(':')[0]) - parseInt(begintime.split(':')[0]);
    var minutes = parseInt(endtime.split(':')[1]) - parseInt(begintime.split(':')[1]);
    return (hours * 60 + minutes) / 14.4;
}

IADAscheduleView.prototype.dayTimeToPercentage = function(time) {
    var hours = parseInt(time.split(':')[0]);
    var minutes = parseInt(time.split(':')[1]);
    return (hours * 60 + minutes) / 14.4;
}

IADAscheduleView.prototype.getTemplateClone = function(id) {
    var newitem = $('#schedule-templates').find('#'+id).clone();
    newitem.removeAttr('id');
    newitem.show();
    return newitem;
}

IADAscheduleView.prototype.getDatesBetween = function(begin, end) {
    begin = new Date(begin).setHours(0,0,0,0);
    end = new Date(end).setHours(0,0,0,0);
    var days = [];
    for(var daynr = 0; daynr <= Math.floor((end-begin) / (3600000*24)); daynr += 1) {
        var newday = new Date(begin + (daynr * 3600000 * 24));
        days.push({date: newday.getTime(), name: this.formatDate(newday)});
    }
    return days;
}

IADAscheduleView.prototype.appendDay = function(day) {
    var dayAxisDiv = this.getTemplateClone('dayAxisRowTemplate');
    dayAxisDiv.attr('id', 'label_' + day.date);
    dayAxisDiv.find('div.day-name p').text(day.name.daynamesmall);
    dayAxisDiv.find('div.day-nr p').text(day.name.daynr);
    dayAxisDiv.find('div.month-name p').text(day.name.monthnamesmall);

    $(this.scheduleContainer).find('.day-axis').append(dayAxisDiv);

    var daydiv = this.getTemplateClone('dayRowTemplate');
    $(daydiv).attr('id', day.date);

    for(var i = 0; i < 24; i += 1) {
        var hourpart = this.getTemplateClone('hourTimeFrameTemplate');
        hourpart.attr('id', 'hour_'+ i);
        hourpart.data('time', (i < 10 ? '0' + i : i) + ':00');
        $(daydiv).find('.day-row-time-parts').append(hourpart);
    }

    $(this.scheduleContainer).find('.schedule-body').append(daydiv);
}

IADAscheduleView.prototype.showCurrentDayTimeNeedle = function() {
    this.scheduleContainer.find('.day-row').css('border-color', '#ccc');
    this.scheduleContainer.find('.time-needle').remove();
    this.scheduleContainer.find('.day-axis-row').css('color', '#444');
    var firstDaySecond = this.dateToFirstMSec(new Date());
    var date_row = $('.day-row#' + firstDaySecond);
    this.scheduleContainer.find('.day-axis .day-axis-row#label_' + firstDaySecond).css('color', '#FF8D20');
    if(date_row.length != 0) {
        date_row.css('border-color', '#FF8D20');
        var needle = $('<div>', {class: 'time-needle', style: 'left: ' + this.dayTimeToPercentage(new Date().customFormat('#hhh#:#mm#')) + '%;'});
        date_row.append(needle);
        var schedule = this;
        setTimeout(function() {schedule.showCurrentDayTimeNeedle();}, 30000);
    }
}

IADAscheduleView.prototype.formatDate = function(date) {
    return {
        full: date.customFormat("#DDDD# #DD# #MMMM# #YYYY#"),
        daynr: date.customFormat("#D#"),
        daynamesmall: date.customFormat("#DDD#"),
        monthnamesmall: date.customFormat("#MMM#"),
    }
}

IADAscheduleView.prototype.startAndEndOfWeek = function(date) {

  // If no date object supplied, use current date
  // Copy date so don't modify supplied date
  var now = date? new Date(date) : new Date();

  // set time to some convenient value
  now.setHours(0,0,0,0);

  // Get the previous Monday
  var monday = new Date(now);
  monday.setDate(monday.getDate() - monday.getDay() + 1);

  // Get next Sunday
  var sunday = new Date(now);
  sunday.setDate(sunday.getDate() - sunday.getDay() + 7);

  // Return array of date objects
  return [monday.customFormat('#YYYY#-#MM#-#DD#'), sunday.customFormat('#YYYY#-#MM#-#DD#')];
}

IADAscheduleView.prototype.startAndEndOfMonth = function(date, monthdiff) {
    var now = date? new Date(date) : new Date();
    var monthdiff = monthdiff? monthdiff : 0;

    // set time to some convenient value
    now.setHours(0,0,0,0);

    var y = now.getFullYear(), m = now.getMonth();
    var firstDay = new Date(y, m + monthdiff, 1);
    var lastDay = new Date(y, m + monthdiff + 1, 0);

      // Return array of date objects
      return [firstDay.customFormat('#YYYY#-#MM#-#DD#'), lastDay.customFormat('#YYYY#-#MM#-#DD#')];
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