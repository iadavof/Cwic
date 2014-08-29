APP.util = {
  // Fills 'dropdown' with 'items' considering 'options'. More or less similar to Rails' options_for_select helper.
  fillDropdownWithItems: function(dropdown, items, options) {
    var options = $.extend({ prompt: false, empty: true }, options || {});
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
  }
}

// JavaScript and jQuery extensions
$.size = function(obj) {
  if(typeof Object.keys !== 'undefined') {
    return Object.keys(obj).length
  } else {
    var size = 0, key;
    for(key in obj) {
      if(obj.hasOwnProperty(key)) size++;
    }
    return size;
  }
}
