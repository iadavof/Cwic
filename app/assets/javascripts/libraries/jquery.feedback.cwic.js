IADAFeedback.prototype.options = null;

IADAFeedback.prototype.modal = null;
IADAFeedback.prototype.button = null;
IADAFeedback.prototype.screenshot = null;
IADAFeedback.prototype.techInfo = null;
IADAFeedback.prototype.messageArea = null;

function IADAFeedback(options) {
    this.options = $.extend({
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
    this.modal = APP.modal.openModal('new_feedback_popup', this.getTemplateClone('feedbackStatusTemplate'), this.closeFeedback());
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
    APP.modal.closeModal();
}

IADAFeedback.prototype.generateTechInfo = function() {
    var is_tablet = !!navigator.userAgent.match(/(iPad|SCH-I800|xoom|kindle)/i);
    var is_phone = !is_tablet && !!navigator.userAgent.match(/(iPhone|iPod|blackberry|android 0.5|htc|lg|midp|mmp|mobile|nokia|opera mini|palm|pocket|psp|sgh|smartphone|symbian|treo mini|Playstation Portable|SonyEricsson|Samsung|MobileExplorer|PalmSource|Benq|Windows Phone|Windows Mobile|IEMobile|Windows CE|Nintendo Wii)/i);
    var viewport_x = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var viewport_y = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    var check_plugin = function(name){
      if (navigator.plugins){
        var plugin, i = 0, length = navigator.plugins.length;
        for (; i < length; i++ ){
          plugin = navigator.plugins[i];
          if (plugin && plugin.name && plugin.name.toLowerCase().indexOf(name) !== -1){
            return true;
          } }
        return false;
      } return false;
    };

    var techinfo = {};

    techinfo['User-Agent'] = navigator.userAgent ? navigator.userAgent : 'N/A';
    techinfo['Screen Width'] = window.screen.width ? window.screen.width + 'px' : 'N/A';
    techinfo['Screen Height'] = window.screen.height ? window.screen.height + 'px' : 'N/A';
    techinfo['Viewport Width'] = viewport_x ? viewport_x + 'px' : 'N/A';
    techinfo['Viewport Height'] =  viewport_y ? viewport_y + 'px' : 'N/A';
    techinfo['Cookies Enabled'] = typeof(navigator.cookieEnabled) != 'undefined' ? navigator.cookieEnabled : 'N/A';
    techinfo['Flash'] = check_plugin('flash');
    techinfo['Silverlight'] = check_plugin('silverlight');
    techinfo['Java'] = check_plugin('java');
    techinfo['Quicktime'] = check_plugin('quicktime');
    techinfo['Tablet'] = is_tablet ? true : false;
    techinfo['Phone'] = is_phone ? true : false;
    techinfo['Mobile'] = is_tablet || is_phone ? true : false;

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
