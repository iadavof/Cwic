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



function IADAscheduleView(options) {

    this.options = Object.extend({
        container: 'schedule-container'
    }, options || {});

    this.createSchedule();
    this.addTimeAxis();
    this.loadScheduleObjects();
    this.initDayRowScheduleObjectRows();
    this.addAllScheduleItems();

}

IADAscheduleView.prototype.addTimeAxis = function() {
    var timeAxis = $(this.scheduleContainer).find('.time-axis')

    for(var i = 0; i < 24; i += 1) {
        var hourpart = this.getTemplateClone('hourTimeAxisFrameTemplate');
        $(hourpart).attr('id', 'hour_'+ i);
        $(hourpart).find('p.time').text(i + ':00');
        $(timeAxis).append(hourpart);
    }

    timeAxis.sticky({getWidthFrom: '.schedule-body'});
}

IADAscheduleView.prototype.createSchedule = function() {
    var beginDate = "2013-06-05";
    var endDate = "2013-06-20";

    var days = this.getDatesBetween(Date.parse(beginDate), Date.parse(endDate));

    this.scheduleContainer = $('#' + this.options.container);
    this.scheduleContainer.append(this.getTemplateClone('scheduleContainerTemplate').contents());
    this.scheduleContainer.addClass('schedule-container');


    for(var daynr in days) {
        this.appendDay(days[daynr]);
    }

}

IADAscheduleView.prototype.loadScheduleObjects = function() {


    schedule_objects = [
    {
        schedule_object_id: 1,
        items: [
            {
                itemid: 1,
                begin_date: '2013-06-05',
                end_date: '2013-06-05',
                begin_time: '20:30',
                end_time: '23:30',
                color: '#FF0000',
            },
            {
                itemid: 2,
                begin_date: '2013-06-07',
                end_date: '2013-06-07',
                begin_time: '9:00',
                end_time: '17:00',
                color: '#00FF00',
            },
            {
                itemid: 3,
                begin_date: '2013-06-08',
                end_date: '2013-06-08',
                begin_time: '16:30',
                end_time: '23:30',
                color: '#0000FF',
            },
        ],
    },

    {
        schedule_object_id: 2,
        schedule_object_color: '#0000FF',
        items: [
            {
                itemid: 1,
                begin_date: '2013-06-05',
                end_date: '2013-06-05',
                begin_time: '20:30',
                end_time: '23:30',
               color: '#FF0000',
            },
            {
                itemid: 2,
                begin_date: '2013-06-07',
                end_date: '2013-06-07',
                begin_time: '20:30',
                end_time: '23:30',
                color: '#00FF00',
            },
            {
                itemid: 3,
                begin_date: '2013-06-08',
                end_date: '2013-06-08',
                begin_time: '16:30',
                end_time: '23:30',
                color: '#0000FF',
            },
        ],
    },

    ];

    this.scheduleObjects = schedule_objects;
}

IADAscheduleView.prototype.initDayRowScheduleObjectRows = function() {
    for(var schi in this.scheduleObjects) {
        var schobject = this.scheduleObjects[schi];
        var newSchObjItemParts = this.getTemplateClone('dayRowScheduleObjectItemPartsTemplate');
        newSchObjItemParts.attr('id', 'scheduleObject_' + schobject.schedule_object_id);
        $(this.scheduleContainer).find('.day-row .day-row-schedule-objects').append(newSchObjItemParts);

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
        for(var dayi in days) {

        }

        //TODO meerdaarse items
    }
}

IADAscheduleView.prototype.addSingleDayItem = function(dayRowScheduleRow, item, schedule_object_id) {
    var newScheduleItem = this.getTemplateClone('scheduleItemTemplate');
    newScheduleItem.css('left', + this.dayTimeToPercentage(item.begin_time) + '%');
    newScheduleItem.css('width', + this.dayTimePercentageSpan(item.begin_time, item.end_time) + '%');
    newScheduleItem.css('background-color', item.color);

    $(dayRowScheduleRow).find('#scheduleObject_' + schedule_object_id).append(newScheduleItem);
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
    var daydiv = this.getTemplateClone('dayRowTemplate');
    $(daydiv).attr('id', day.date);
    $(daydiv).find('p.day-name').text(day.name);

    for(var i = 0; i < 24; i += 1) {
        var hourpart = this.getTemplateClone('hourTimeFrameTemplate');
        $(hourpart).attr('id', 'hour_'+ i);
        $(daydiv).find('.day-row-time-parts').append(hourpart);
    }

    $(this.scheduleContainer).find('.schedule-body').append(daydiv);
}

IADAscheduleView.prototype.formatDate = function(date) {
    return date.customFormat("#DDDD# #DD# #MMMM# #YYYY#");
}

Date.prototype.customFormat = function(formatString){
    var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
    var dateObject = this;
    YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
    MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
    MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
    DD = (D=dateObject.getDate())<10?('0'+D):D;
    DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObject.getDay()]).substring(0,3);
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