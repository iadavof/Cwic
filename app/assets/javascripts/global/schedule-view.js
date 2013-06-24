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


function IADAscheduleView(options) {

    this.options = Object.extend({
        container: 'schedule-container'
    }, options || {});

    this.createSchedule();

}

IADAscheduleView.prototype.createSchedule = function() {
    var beginDate = "2013-06-05";
    var endDate = "2013-06-20";

    var days = this.getDatesBetween(Date.parse(beginDate), Date.parse(endDate));
    console.debug(days);

}

IADAscheduleView.prototype.getDatesBetween = function(begin, end) {
    var days = [];
    for(var daynr = 0; daynr < Math.floor((end-begin) / (3600000*24)); daynr += 1) {
        days.push(begin + (daynr * 3600000));
    }
    return days;
}

IADAscheduleView.prototype.appendDay = function() {


}

IADAscheduleView.prototype.initTemplates = function() {
    $.template('dayRowTemplate', '<div class="day-row"><p class="day-name">${name}</p><div class="day-row-time-parts"></div></div>');
}