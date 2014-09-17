function CwicContactList(options) {
  this.options = $.extend({
    container: 'contact-list-container',
    backend_url: 'url to backend',
    organisation_client_id: 0,
  }, options || {});

  this.contactListContainer = $('#' + this.options.container);

  this.init();

  this.contacts = [];
};

CwicContactList.prototype.init = function() {
  this.contactListContainer.html(APP.util.getTemplateClone('contactListContainer'));
  this.contactListContainer.addClass('contact-list-container');

  this.bindAlphabetButtons();
  this.bindSearchOnChange();
  this.bindShowContactAction();

  this.getContacts();
};

CwicContactList.prototype.getContacts = function() {
  var _this = this;

  $.ajax({
    url: this.options.backend_url + '.json',
    success: function(response) {
      _this.afterGetContacts(response);
    },
  });
};

CwicContactList.prototype.getContactShow = function(contact_id, contact_info_container) {
  var _this = this;
  $.ajax({
    url: this.options.backend_url +  '/' + contact_id + '.json',
    success: function(response) {
      _this.afterContactShowRequest(response, contact_info_container);
    },
  });
};

CwicContactList.prototype.bindShowContactAction = function() {
  var _this = this;
  this.contactListContainer.find('div.list').on('click', 'div.contact span.name, div.contact span.position', function() {
    var contact = $(this).closest('div.contact');
    var contact_info_container = contact.find('div.contact-info');
    if(contact_info_container.hasClass('open')) {
      contact_info_container.removeClass('open');
    } else {
      contact_info_container.find('dl').remove();
      contact_info_container.addClass('open ajax_wait');

      var contact_id = contact.data('OrganisationClientContactId');
      _this.getContactShow(contact_id, contact_info_container);
    }
  });
};

CwicContactList.prototype.afterContactShowRequest = function(response, contact_info_container) {
  var _this = this;
  contact_info_container.removeClass('ajax-wait');
  contact_info_container.find('a.vcard-download').attr('href', response.vcard_url);

  var dl = $('<dl>');
  $.each(response.list_items, function(key, list_item) {
    dl.append($('<dt>', { text: list_item.label }));
    dl.append($('<dd>', { html: _this.linkyfy(key, list_item) }));
  });
  contact_info_container.append(dl);
};

CwicContactList.prototype.linkyfy = function(key, list_item) {
  switch(key) {
    case 'email':
      return '<a href="mailto:' + list_item.value + '">'+ list_item.value +'</a>';
    case 'phone':
    case 'mobile_phone':
      return '<a href="tel:' + list_item.value + '">'+ list_item.value +'</a>';
    default: return list_item.value;
  }
};

CwicContactList.prototype.sortContacts = function(contacts) {
   return contacts.sort(function(a, b) {
    if(a.instance_name < b.instance_name) return -1;
    if(a.instance_name > b.instance_name) return 1;
    return 0;
  });
};

CwicContactList.prototype.afterGetContacts = function(response) {
  this.contacts = response;
  if(response.length > 0) {
    this.contactListContainer.find('p.no-contacts').remove();
  }
  this.buildContactsList(this.contacts);
};

CwicContactList.prototype.bindSearchOnChange = function() {
  var _this = this;
  this.contactListContainer.find('#contactSearchInput').on('keyup', function(){
    var contactSelection = _this.filterContacts($(this).val());
    _this.clearContactList();
    _this.buildContactsList(contactSelection);
  });
};

CwicContactList.prototype.filterContacts = function(query) {
  if(query == '') {
    return this.contacts;
  }

  var selectedContacts = [];
  $.each(this.contacts, function(i, contact) {
    var regEx = new RegExp(APP.util.escapeRegExp(query), 'i');
    if (  contact.instance_name.search(regEx) != -1 ||
          contact.position.search(regEx) != -1
        ) {
        selectedContacts.push(contact);
    }
  });
  return selectedContacts;
};

CwicContactList.prototype.clearContactList = function() {
  this.contactListContainer.find('div.list').html('');
  this.contactListContainer.find('div.alphabet span').removeClass('active');
};

CwicContactList.prototype.buildContactsList = function(selection) {
  var _this = this;
  var currentLetter = null;

  var sortedContacts = this.sortContacts(selection);

  var nonAlphaContacts = [];
  $.each(sortedContacts, function(key, contact) {
    var contactFirstLetter = contact.instance_name.charAt(0).toLowerCase();

    // Put the non alpha contacts aside
    if (!contactFirstLetter.match(/^[a-zA-Z]+$/)) {
      nonAlphaContacts.push(contact);
    }

    if(currentLetter != contactFirstLetter) {
      _this.appendContactLetter(contactFirstLetter);
      currentLetter = contactFirstLetter;
    }

    _this.appendContactEntry(contact.id, contact.instance_name, contact.position);
  });

  // Process non alpha contacts
  if(nonAlphaContacts.length > 0) {
    this.appendContactLetter('other');
    $.each(nonAlphaContacts, function(key, contact) {
      _this.appendContactEntry(contact.id, contact.instance_name, contact.position);
    });
  }

};

CwicContactList.prototype.appendContactLetter = function(letter) {
  // set this new letter to active in the alphanummeric navigation menu
  this.contactListContainer.find('.alphabet span#contact-start-' + letter).addClass('active');

  var visibleLetter;
  if(letter == 'other') {
    visibleLetter = '...';
  } else {
    visibleLetter = letter.toUpperCase();
  }

  var contactLetter = APP.util.getTemplateClone('contactListLetter');
  contactLetter.attr('id', 'letter-' + letter);
  contactLetter.text(visibleLetter);
  this.contactListContainer.find('.list').append(contactLetter);
};

CwicContactList.prototype.appendContactEntry = function(id, name, position) {
  var contactEntry = APP.util.getTemplateClone('contactListEntry');
  contactEntry.data('OrganisationClientContactId', id);
  contactEntry.find('span.name').text(name);
  contactEntry.find('span.position').text(position ? position : jsLang.global.none);
  this.contactListContainer.find('.list').append(contactEntry);
};

CwicContactList.prototype.scrollToLetter = function(letter) {
  var list = this.contactListContainer.find('div.list');
  list.animate({ scrollTop: list.find('#letter-' + letter).position().top + list.scrollTop() }, 300);
};

CwicContactList.prototype.bindAlphabetButtons = function() {
  var _this = this;
  this.contactListContainer.find('div.alphabet').on('click', 'span', function() {
    var letterButton = $(this);
    if(letterButton.hasClass('active')) {
      var alphaLetter = letterButton.attr('id').split('-')[2];
      _this.scrollToLetter(alphaLetter);
    }
  });
};
