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
IADAscheduleView.prototype.options = null;
IADAscheduleView.prototype.beginDate = null;
IADAscheduleView.prototype.endDate = null;



function IADAscheduleView(options) {

    this.options = Object.extend({
        container: 'schedule-container'
    }, options || {});

    this.loadScheduleObjects();

}

IADAscheduleView.prototype.addTimeAxis = function() {
    var timeAxis = $(this.scheduleContainer).find('.time-axis')

    for(var i = 1; i < 24; i += 1) {
        var hourpart = this.getTemplateClone('hourTimeAxisFrameTemplate');
        $(hourpart).attr('id', 'hour_'+ i);
        $(hourpart).find('p.time').text(i);
        $(timeAxis).append(hourpart);
    }

    timeAxis.sticky({getWidthFrom: '.schedule-body'});
}

IADAscheduleView.prototype.createSchedule = function() {
    var days = this.getDatesBetween(Date.parse(this.beginDate), Date.parse(this.endDate));

    this.scheduleContainer = $('#' + this.options.container);
    this.scheduleContainer.append(this.getTemplateClone('scheduleContainerTemplate').contents());
    this.scheduleContainer.addClass('schedule-container');


    for(var daynr in days) {
        this.appendDay(days[daynr]);
    }

}

IADAscheduleView.prototype.loadScheduleObjects = function() {

    schedule = this;
/*
    this.beginDate = '2013-08-08';
    this.endDate = '2013-08-12';
*/
    $.ajax({
        type: 'POST',
        url: './reservations/index_domain',
        data: {
            entity_ids: '1,2,3',
            schedule_begin: this.beginDate,
            schedule_end: this.endDate,
        }
    }).success(function(response) {
        schedule.afterScheduleObjectsLoad(response);
    });
}

IADAscheduleView.prototype.afterScheduleObjectsLoad = function(response) {
    this.scheduleObjects = response.schedule_objects;
    this.beginDate = response.begin_date;
    this.endDate = response.end_date;

    this.createSchedule();
    this.addTimeAxis();
    this.initDayRowScheduleObjectRows();
    this.addAllScheduleItems();
}

IADAscheduleView.prototype.initDayRowScheduleObjectRows = function() {
    for(var schi in this.scheduleObjects) {
        var schobject = this.scheduleObjects[schi];
        var newSchObjItemParts = this.getTemplateClone('dayRowScheduleObjectItemPartsTemplate');
        newSchObjItemParts.addClass('scheduleObject_' + schobject.schedule_object_id);
        $(this.scheduleContainer).find('.day-row .day-row-schedule-objects').append(newSchObjItemParts);
    }
    if(this.scheduleObjects != null) {
        if(this.scheduleObjects.length == 1) {
            $('.day-row-schedule-object-item-parts').css('height', '60px');
        } else if(this.scheduleObjects.length == 2) {
            $('.day-row-schedule-object-item-parts').css('height', '30px');
        } else {
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
        var beginDate = Date.parse(item.begin_date);
        this.addSingleDayItem($(this.scheduleContainer).find('#'+ beginDate), item, schedule_object_id);
    } else {
        var beginDate = Date.parse(item.begin_date);
        var endDate = Date.parse(item.end_date);
        var days = this.getDatesBetween(beginDate, endDate);
        for(var dayi = 0; dayi < days.length; dayi += 1) {
            switch(dayi) {
                case 0:
                    var schedulePart = this.addSingleDayBlock($(this.scheduleContainer).find('#'+ days[dayi].date), item.begin_time, '24:00', item.color, item.description, schedule_object_id);
                    schedulePart.find('div.continue.right').show();
                    break;
                case days.length - 1:
                    var schedulePart = this.addSingleDayBlock($(this.scheduleContainer).find('#'+ days[dayi].date), '00:00', item.end_time, item.color, item.description, schedule_object_id);
                    schedulePart.find('div.continue.left').show();
                    break;
                default:
                    var schedulePart = this.addSingleDayBlock($(this.scheduleContainer).find('#'+ days[dayi].date), '00:00', '24:00', item.color, item.description, schedule_object_id);
                    schedulePart.find('div.continue').show();
            }
        }
    }
}

IADAscheduleView.prototype.addSingleDayBlock = function(dayRowScheduleRow, begin_time, end_time, color, text, schedule_object_id) {
    var newScheduleItem = this.getTemplateClone('scheduleItemTemplate');
    newScheduleItem.css('left', + this.dayTimeToPercentage(begin_time) + '%');
    newScheduleItem.css('width', + this.dayTimePercentageSpan(begin_time, end_time) + '%');
    newScheduleItem.css('background-color', color);
    newScheduleItem.find('p.item-text').text(text);
    newScheduleItem.find('p.item-text').attr('title', text);
    $(dayRowScheduleRow).find('.scheduleObject_' + schedule_object_id).append(newScheduleItem);
    return newScheduleItem;
}

IADAscheduleView.prototype.addSingleDayItem = function(dayRowScheduleRow, item, schedule_object_id) {
    this.addSingleDayBlock(dayRowScheduleRow, item.begin_time, item.end_time, item.color, item.description, schedule_object_id);
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
    var days = [];
    for(var daynr = 0; daynr < Math.floor((end-begin) / (3600000*24)); daynr += 1) {
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
        $(hourpart).attr('id', 'hour_'+ i);
        $(daydiv).find('.day-row-time-parts').append(hourpart);
    }

    $(this.scheduleContainer).find('.schedule-body').append(daydiv);
}

IADAscheduleView.prototype.formatDate = function(date) {
    return {
        full: date.customFormat("#DDDD# #DD# #MMMM# #YYYY#"),
        daynr: date.customFormat("#D#"),
        daynamesmall: date.customFormat("#DDD#"),
        monthnamesmall: date.customFormat("#MMM#"),
    }
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