IADAFeedback.prototype.options = null;

IADAFeedback.prototype.modal = null;
IADAFeedback.prototype.button = null;
IADAFeedback.prototype.screenshot = null;
IADAFeedback.prototype.techInfo = null;
IADAFeedback.prototype.messageArea = null;

function IADAFeedback(options) {

    this.options = Object.extend({
        open_button_id: 'open-feedback-button',
        backend_url: 'url to backend',
    }, options || {});

    // check if modal is opened and close if it is
    if(window.location.hash == '#new_feedback') {
        window.location.hash = '';
    }

    this.bindOpenFeedbackButton();

}

IADAFeedback.prototype.bindOpenFeedbackButton = function() {
    var fb = this;
    this.button = $('#' + this.options.open_button_id);
    this.button.on('click', function() { fb.openFeedbackModal(); });
}

IADAFeedback.prototype.openFeedbackModal = function() {
    this.button.attr('disabled', 'disabled');
    this.modal = $('#new_feedback_popup');

    // Bind small close button
    this.modal.find('a.close').on('click', function() { fb.closeFeedback(); });

    // Bind Overlay action
   $('a.overlay').on('click', function() { fb.closeFeedback(); });

    // message text area
    this.messageArea = this.modal.find('textarea#feedback-message');

    this.takeScreenshot();

    // bind next button
    var fb = this;
    this.modal.find('button#next-feedback').on('click', function() {
        fb.reviewFeedback();
    });

    window.location.hash = 'new_feedback';
}

IADAFeedback.prototype.takeScreenshot = function() {
    var fb = this;
    html2canvas(document.body, {
         onrendered: function(canvas) {
            fb.screenshot = canvas.toDataURL("image/png");
        }
    });
}

IADAFeedback.prototype.reviewFeedback = function() {
    var fb = this;

    this.modal.children(':not(a.close)').hide();


    var screenshotImg = this.modal.find('img#screenshot_preview');
    screenshotImg.attr('src', this.screenshot);
    screenshotImg.show();

    var messageSummary = this.modal.find('p#feedback-message-summary');
    var link = messageSummary.find('a');
    messageSummary.html('');
    messageSummary.append(link);
    messageSummary.append(this.messageArea.val());

    this.modal.find('a#edit_feedback_button').on('click', function(e) {
        e.preventDefault();
        messageSummary.hide();
        messageSummary.after(fb.messageArea);
        return false;
    });

    var techInfo = this.generateTechInfo();

    this.modal.find('div.feedback-tech-info p#tech-info-summary').text(techInfo);

    var sendButton = this.modal.find('button#send-feedback');
    sendButton.on('click', function() { fb.sendFeedback(); });

    this.modal.find('div.feedback-review').show();
}

IADAFeedback.prototype.closeFeedback = function() {
    this.modal.children(':not(a.close)').hide();
    this.modal.children().off('click');

    this.screenshot = null;


    window.location.hash = 'close';

    this.modal.find('p#feedback-message-summary').show();
    var textBox = this.modal.find('div.feedback-text');
    textBox.find('#feedback-intro').after(this.messageArea);
    textBox.show();

}

IADAFeedback.prototype.generateTechInfo = function() {
    var techinfo = {};

    var session = window.session;

    techinfo['Browser'] = session.browser.browser;
    techinfo['Browser version'] = session.browser.version;
    techinfo['Browser os'] = session.browser.os;
    techinfo['Flash'] = session.plugins.flash;
    techinfo['Silverlight'] = session.plugins.silverlight;
    techinfo['Java'] = session.plugins.java;
    techinfo['Quicktime'] = session.plugins.quicktime;
    techinfo['Screen Width'] = session.device.screen.width + 'px';
    techinfo['Screen Height'] = session.device.screen.height + 'px';
    techinfo['Viewport Width'] = session.device.viewport.width + 'px';
    techinfo['Viewport Height'] = session.device.viewport.height + 'px';
    techinfo['Tablet'] = session.device.is_tablet;
    techinfo['Phone'] = session.device.is_phone;
    techinfo['Mobile'] = session.device.is_mobile;

    this.techInfo =  this.objectToString(techinfo);
    return this.techInfo;
}

IADAFeedback.prototype.objectToString = function(obj) {
    var newObj = $.map(obj, function(val,index) {
        var str = index + ": " + val;
        return str;
    });
    return newObj.join(", ");
}

IADAFeedback.prototype.sendFeedback = function() {
    var fb = this;

    // hide feedback texts
    fb.modal.find('h3#feedback-success, p#feedback-success-explain, h3#feedback-error, p#feedback-error-explain, div.feedback-status').hide();

    $.ajax({
            type: 'POST',
            url: this.options.backend_url,
            data: {
                feedback: {
                    message: fb.messageArea.val(),
                    specs: fb.techInfo,
                    screen_capture: encodeURIComponent(fb.screenshot),
                }

            }
        }).fail(function(){
            fb.modal.children(':not(a.close)').hide();
            fb.modal.find('h3#feedback-error, p#feedback-error-explain, div.feedback-status').show();
            fb.button.removeAttr('disabled');

            var closeButton = fb.modal.find('button#close-feedback');
            closeButton.on('click', function() { fb.closeFeedback(); });
            closeButton.show();
        }).success(function(response) {
            fb.modal.children(':not(a.close)').hide();
            fb.modal.find('h3#feedback-success, p#feedback-success-explain, div.feedback-status').show();
            fb.button.removeAttr('disabled');
            fb.messageArea.val('');
            var closeButton = fb.modal.find('button#close-feedback');
            closeButton.on('click', function() { fb.closeFeedback(); });
            closeButton.show();
        });

}
