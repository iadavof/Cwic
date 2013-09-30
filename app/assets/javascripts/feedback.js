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

    this.bindOpenFeedbackButton();

}

IADAFeedback.prototype.bindOpenFeedbackButton = function() {
    var fb = this;
    this.button = $('#' + this.options.open_button_id);
    this.button.on('click', function() { fb.openFeedbackModal(); });
}

IADAFeedback.prototype.openFeedbackModal = function() {
    this.button.attr('disabled', 'disabled');
    this.modal = openModal('new_feedback_popup', this.getTemplateClone('feedbackStatusTemplate'), this.closeFeedback());
    this.modal.attr('data-html2canvas-ignore', 'true');
    this.modal.find('p#creating_screenshot').css('visibility', 'visible');

    this.takeScreenshot();

}

IADAFeedback.prototype.renderFeedbackTextInput = function() {
    this.modal.children(':not(a.close)').remove();
    this.modal.append(this.getTemplateClone('feedbackTextTemplate'));

    // message text area
    this.messageArea = this.modal.find('textarea#feedback-message');

    // bind next button
    var fb = this;
    this.modal.find('button#next-feedback').on('click', function() {
        fb.reviewFeedback();
    });
}

IADAFeedback.prototype.takeScreenshot = function() {
    var fb = this;

    html2canvas(document.body, {
         onrendered: function(canvas) {
            fb.screenshot = canvas.toDataURL("image/png");
            fb.renderFeedbackTextInput();
        }
    });
}

IADAFeedback.prototype.reviewFeedback = function() {
    var fb = this;

    this.modal.children(':not(a.close)').remove();

    this.modal.append(this.getTemplateClone('feedbackReviewTemplate'));

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
}

IADAFeedback.prototype.closeFeedback = function() {
    this.screenshot = null;
    closeModal();
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

    // remove previous page
    this.modal.children(':not(a.close)').remove();
    this.modal.append(this.getTemplateClone('feedbackStatusTemplate'));

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
            fb.modal.find("div.feedback-status").css('background-image', 'none');
            fb.modal.find("#feedback-success").hide();
            fb.modal.find("#feedback-success-explain").hide();
            fb.modal.find("#creating_screenshot").hide();
            fb.modal.find('#feedback-error, p#feedback-error-explain, div.feedback-status').css('visibility', 'visible');
            fb.button.removeAttr('disabled');

            var closeButton = fb.modal.find('button#close-feedback');
            closeButton.on('click', function() { fb.closeFeedback(); });
        }).success(function(response) {
            fb.modal.find("div.feedback-status").css('background-image', 'none');
            fb.modal.find("#feedback-error").hide();
            fb.modal.find("#feedback-error-explain").hide();
            fb.modal.find("#creating_screenshot").hide();
            fb.modal.find('#feedback-success, p#feedback-success-explain, div.feedback-status').css('visibility', 'visible');
            fb.button.removeAttr('disabled');
            var closeButton = fb.modal.find('button#close-feedback');
            closeButton.on('click', function() { fb.closeFeedback(); });
            closeButton.show();
        });

}

IADAFeedback.prototype.getTemplateClone = function(id) {
    var newitem = $('#feedback-templates').find('#' + id).clone();
    newitem.removeAttr('id');
    newitem.show();
    return newitem;
}