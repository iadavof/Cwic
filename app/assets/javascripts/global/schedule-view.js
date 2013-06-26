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
IADAscheduleView.prototype.scheduleItems = null;
IADAscheduleView.prototype.options = null;



function IADAscheduleView(options) {

    this.options = Object.extend({
        container: 'schedule-container'
    }, options || {});

    this.createSchedule();
    this.loadScheduleItems();

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

IADAscheduleView.prototype.loadScheduleItems = function() {
    items = [
        {
            itemid: 1,
            begin: '2013-06-05 20:30',
            end: '2013-06-05 23:30',
            color: '#FF0000',
        },
        {
            itemid: 2,
            begin: '2013-06-07 16:00',
            end: '2013-06-07 20:30',
            color: '#00FF00',
        },
        {
            itemid: 3,
            begin: '2013-06-09 11:30',
            end: '2013-06-09 20:00',
            color: '#0000FF',
        },
    ];
    this.scheduleItems = items;
}

IADAscheduleView.prototype.addScheduleItem = function(item) {
    var beginDay = selectDayRowWithDate(item.begin);
    var endDay = selectDayRowWithDate(item.end);
    if(beginDay == endDay) {
        this.addSingleDayItem(beginDay, item);
    } else {
        //TODO meerdaarse items
    }
}

IADAscheduleView.prototype.addSingleDayItem = function(dayrow, item) {
    var newScheduleItem = this.getTemplateClone('scheduleItemTemplate');
    newScheduleItem.css('left', + this.dayTimeToPercentage(item.begin) * '%');
    newScheduleItem.css('width', + this.dayTimePercentageSpan(item.begin, item.end) * '%');

    $(dayrow).append()
}

IADAscheduleView.prototype.dayTimeToPercentage = function(begintime, endtime) {
    var begin = Date.parse(item.begin);
    var end = Date.parse(item.end);
    var time = begin - end;
    return (time.getHours() * 60 + time.getMinutes()) / 14.4;
}

IADAscheduleView.prototype.dayTimeToPercentage = function(time) {
    var time = Date.parse(time);
    return (time.getHours() * 60 + time.getMinutes()) / 14.4;
}

IADAscheduleView.prototype.selectDayRowWithDate = function(itemdate) {
    var itemDate = Date.parse(itemdate);
    var beginItemDate = Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
    return $(this.scheduleContainer).find('#' + beginItemDate.getTime());
}


IADAscheduleView.prototype.getTemplateClone = function(id) {
    var newitem = $('#schedule-templates').find('#'+id).clone();
    console.debug(newitem);
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