APP.util = {
  // Fills 'dropdown' with 'items' considering 'options'. More or less similar to Rails' options_for_select helper.
  fillDropdownWithItems: function(dropdown, items, options) {
    options = $.extend({ prompt: false, empty: true }, options || {});
    if(options['empty']) {
      dropdown.empty();
    }
    if(options['prompt']) {
      $(new Option((typeof options['prompt'] === 'string' ? options['prompt'] : jsLang.global.prompt), '')).appendTo(dropdown);
    }
    for(key in items) {
      $(new Option(items[key], key)).appendTo(dropdown);
    }
    dropdown.val(dropdown.data('previous-value'));
    dropdown.cwicControl('recreate');
  },
  // Translates all keys in 'array' using 'library'
  getTranslationsForArray: function(array, library) {
    translations = {};
    for(i in array) {
      key = array[i];
      translations[key] = library.key;
    }
    return translations;
  },
  // Escape strings/names for use in jQuery selectors
  escapeForSelector: function(string) {
    return string.replace(/(:|\.|\[|\])/g,'\\$1');
  },
  // Translate an array to a human readable sentence with comma's and the word 'and'
  arrayToSentence: function(array) {
    if(array.length <= 1) {
      return array
    } else {
      return array.slice(0, array.length - 1).join(', ') + jsLang.global.and_connector + array.slice(-1);
    }
  },
  // Format text for output (basically by translating the empty string with the text /empty/)
  formatText: function(text) {
    if(text == '') {
       return '<em>' + jsLang.global.none + '</em>';
    } else {
      return text;
    }
  },
  // Escape string for use in a jQuery selector
  escapeJQuerySelectorString: function(str) {
    if(str) {
      return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
    } else {
      return str;
    }
  },
  arrayKeys: function(input) {
    var output = new Array();
    var counter = 0;
    for (i in input) {
      output[counter++] = i;
    }
    return output;
  },
  arrayValues: function(input) {
    var output = new Array();
    var counter = 0;
    for (i in input) {
      output[counter++] = input[i];
    }
    return output;
  },
  getTemplateClone: function(id) {
    var newitem = $($('#' + id).text());
    APP.global.initializeSpecialFormFields(newitem);
    return newitem;
  },
  setFieldErrorState: function(field, state, options) {
    this.setFieldValidationState(field, 'error', state, options);
  },
  setFieldWarningState: function(field, state, options) {
    this.setFieldValidationState(field, 'warning', state, options);
  },
  setFieldValidationState: function(field, type, state, options) {
    options = $.extend({ label: true }, options || {});
    if(options.label) {
     $('label[for="'+ field.attr('id') +'"]').toggleClass('validation-'+ type, state);
    }
    field.toggleClass('validation-'+ type, state);
  },
  ucFirst: function(string) {
    return string.substring(0, 1).toUpperCase() + string.substring(1).toLowerCase();
  },
  escapeRegExp: function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },
  expandCollapse: function(selector, options, complete) {
    if (!selector) {
      return;
    }

    var $elem = $(selector);

    if (!$elem.length > 0) {
      return;
    }

    var defaults = {
      action: 'expand', // 'expand' or 'collapse'
      direction: 'horizontal', // 'horizontal' or 'vertical'
      animationFunction: 'swing', // animation function supported by Velocity.js
      duration: 0,
      targetDimension: '', // CSS value for dimension property (height or width)
    };

    options = options ? options : {};
    options = $.extend({}, defaults, options);

    if (($elem.hasClass('open') && options.action != 'collapse') || (!$elem.hasClass('open') && options.action == 'collapse')) {
      return;
    }

    var getTargetStyle = function() {
      var result = {};
      if (options.action == 'collapse') {
        result = options.direction == 'vertical' ? {height: 0} : {width: 0};
      } else {
        $elem.hide().css(options.direction == 'vertical' ? {height: options.targetDimension} : {width: options.targetDimension})
        result = options.direction == 'vertical' ? {height: $elem.height() + 'px'} : {width: $elem.width() + 'px'};
        $elem.css(options.direction == 'vertical' ? {height: 0} : {width: 0}).show();
      }
      return result;
    };

    var style = {
      target: getTargetStyle(),
      auto: options.direction == 'vertical' ? {height: options.targetDimension} : {width: options.targetDimension},
    };

    var complete = complete ? complete : function() {};

    var callback = options.action == 'collapse' ? function() {
      $elem.removeClass('open');
      complete();
    } : function() {
      $elem.addClass('open');
      $elem.css(style.auto);
      complete();
    };

    if (options.duration > 0) {
      $elem.velocity(style.target, options.duration, options.animationFunction, callback);
    } else {
      $elem.css(style.target);
      callback();
    }
  },
  getScrollbarWidth: function() {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
    document.body.appendChild(outer);
    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";
    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);
    var widthWithScroll = inner.offsetWidth;
    // remove divs
    outer.parentNode.removeChild(outer);
    return widthNoScroll - widthWithScroll;
  }
};

// JavaScript and jQuery extensions

// $.size to easy get the size (length) of objects (hashes)
$.size = function(obj) {
  if(typeof Object.keys !== 'undefined') {
    return Object.keys(obj).length;
  } else {
    var size = 0, key;
    for(key in obj) {
      if(obj.hasOwnProperty(key)) size++;
    }
    return size;
  }
};

// $.patch, $.put and $.delete to easily send patch, put or delete AJAX request (similar to $.post and $.get)
jQuery.each(['patch', 'put', 'delete'], function(i, method) {
  jQuery[method] = function(url, data, callback, type) {
    if(jQuery.isFunction(data)) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return jQuery.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    });
  };
});
