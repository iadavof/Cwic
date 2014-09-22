CwicStickyNotes.prototype.defaultNote = {
  id: null,
  author: { id: 0, name: '' },
  weight: 0,
  created_at: ''
};

function CwicStickyNotes(options) {
  this.options = $.extend({
    container: 'note-container',
    backend_url: 'url to backend',
    current_author: { id: 0, name: 'Name' }
  }, options || {});

  this.noteContainer = $('#' + this.options.container);
  this.bindControls();
  this.getNotes();
}

CwicStickyNotes.prototype.getNotes = function() {
  var sn = this;

  $.ajax({
    type: 'GET',
    url: this.options.backend_url + '.json'
  }).fail(function(){
    window.log('Error getting notes');
  }).success(function(response) {
    if(response && response.length > 0) {
      sn.renderNotes(response);
    }
  });
};

CwicStickyNotes.prototype.saveNote = function(note_element) {
  var note = $(note_element);
  var new_note = false;
  var textarea = note.find('textarea');

  var url, method;
  if(typeof(note.attr('id')) == 'undefined') {
    // New note (create action)
    new_note = true;
    url = this.options.backend_url + '.json';
    method = 'POST';
  } else {
    // Existing note (update action)
    url = this.options.backend_url + '/' + this.noteId(note) + '.json';
    method = 'PATCH';
  }

  note.find('img.ajax-wait').show();
  $.ajax({
    type: method,
    url: url,
    data: {
      sticky: {
        sticky_text: textarea.val()
      }
    }
  }).fail(function(){
    window.log('Error saving');
  }).success(function(response) {
    if(new_note && response) {
      note.attr('id', 'note_' + response.id);
      note.find('p.created_at').data('timestamp', response.created_at);
      note.find('p.created_at').attr('title', moment(response.created_at).format('LLLL'));
    }
    note.find('img.ajax-wait').hide();
    note.find('p.saved_notification').show();
  });
};

CwicStickyNotes.prototype.setTimestamps = function() {
  var timepies = $('div.notes div.note div.note-head p.created_at');

  timepies.each(function() {
    var p = $(this);
    var timestamp = moment(p.data('timestamp'));
    p.text(timestamp.fromNow());
  });
};

CwicStickyNotes.prototype.renderNotes = function(notes) {
  for(noteNr in notes) {
    current = notes[noteNr];
    this.renderNote(current);
  }

  var schedule = this;

  setInterval(function(){ schedule.setTimestamps(); }, 30000);
};

CwicStickyNotes.prototype.bindControls = function() {
  var sn = this;
  $('button.new-sticky').on('click', function() { sn.newNote(); });
};

CwicStickyNotes.prototype.newNote = function() {
  var note = this.defaultNote;
  note.author = this.options.current_author;
  now = moment();
  note.created_at = now.format('YYYY-MM-DD HH:mm');
  this.renderNote(note);
};

CwicStickyNotes.prototype.renderNote = function(note_obj) {
  var sn = this;
  var note = APP.util.getTemplateClone('note-template');
  var textarea = note.find('textarea');

  if(note_obj.id != null) {
    note.attr('id', 'note_' + note_obj.id);
  } else {
    note.addClass('new_note');
    textarea.attr('placeholder', jsLang.stickies.placeholder);
  }

  note.find('p.author').text(note_obj.author.name);
  note.find('p.created_at').data('timestamp', note_obj.created_at);
  var timestamp = moment(note_obj.created_at);
  note.find('p.created_at').attr('title', timestamp.format('LLLL'));
  note.find('p.created_at').text(timestamp.fromNow());
  // Bind note events
  note.find('a.delete-button').on('click', function(){ sn.deleteNote(this); });

  textarea.val(note_obj.sticky_text);
  textarea.on('blur', function(){ sn.afterNoteEdit(this); });
  textarea.on('focus', function(){ sn.uponNoteEdit(this); });
  note.find('a.save-button').on('click', function(){ sn.afterNoteEdit(this); });
  textarea.autosize();

  var innerNotesContainer = this.noteContainer.find('div.notes');
  innerNotesContainer.sortable({
    handle: 'div.note-head',
    connectWith: '.notes',
    start: function(e, ui) {
      if(!ui.item.attr('id')) {
        // Note not saved yet. We need to save the sticky first, so it has an id.
        sn.afterNoteEdit(ui.item);
      }
      ui.placeholder.height(ui.item.outerHeight());
      ui.placeholder.width(ui.item.outerWidth());
    },
    stop: function(e, ui) {
      sn.afterNoteMove(ui);
    },
    placeholder: 'ui-state-highlight'
  });

  if(note_obj.id == null) {
    innerNotesContainer.prepend(note);
  } else {
    innerNotesContainer.append(note);
  }

  // Focus on new note
  if(note_obj.id == null) {
    textarea.focus();
    textarea.select();
  }
};

CwicStickyNotes.prototype.afterNoteMove = function(ui) {
  var sn = this;
  var notes = this.noteContainer.find('div.notes div.note');

  var weights = {};
  notes.each(function(index, note) {
    weights[sn.noteId($(note))] = index;
  });

  $.ajax({
    type: 'PATCH',
    url: this.options.backend_url + '/update_weights.json',
    data: {
      weights: weights
    }
  }).fail(function(){
    window.log('Error updating note order');
  });
};

CwicStickyNotes.prototype.afterNoteEdit = function(element) {
  var note = $(element).closest('div.note');
  if(note.hasClass('focus')) {
    note.find('a.save-button').hide();
    note.find('textarea').focus();
    this.saveNote(note);
    note.removeClass('focus');
  }
};

CwicStickyNotes.prototype.uponNoteEdit = function(element) {
  var note = $(element).parents('div.note');
  if(!note.hasClass('focus')) {
    note.addClass('focus');
    note.find('p.saved_notification').hide();
    note.find('a.save-button').show();
    var textarea = note.find('textarea');
    textarea.focus();
  }
};

CwicStickyNotes.prototype.deleteNote = function(element) {
  var note = $(element).parents('div.note');
  note.hide();

  if(typeof(note.attr('id')) != 'undefined') {
    $.ajax({
      type: 'DELETE',
      url: this.options.backend_url + '/' + this.noteId(note) + '.json'
    }).fail(function(){
      window.log('Error deleting note');
    });
  }

  note.remove();
};

CwicStickyNotes.prototype.noteId = function(note) {
  return note.attr('id').split('_')[1]; // IMPROVEMENT: save note in data attribute instead of getting it through split this way
};
