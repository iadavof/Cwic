IADAStickyNotes.prototype.options = null;
IADAStickyNotes.prototype.noteContainer = null;

IADAStickyNotes.prototype.defaultNote = {
        id: null,
        author: {id: 0, name: ''},
        weight: 0,
        created_at: '',
}

function IADAStickyNotes(options) {

    this.options = Object.extend({
        container: 'note-container',
        backend_url: 'url to backend',
        resource: '',
        resource_id: 0,
        current_author: {id: 0, name: 'Name' },
        placeholder: 'Text',
    }, options || {});

    this.noteContainer = $('#' + this.options.container);

    this.bindControls();

    this.getNotes();
}

IADAStickyNotes.prototype.getNotes = function() {
    var sn = this;

    $.ajax({
            type: 'GET',
            url: this.options.backend_url + '/' + this.options.resource + '/' + this.options.resource_id + '.json',
        }).fail(function(){
            window.log("Error getting notes");
        }).success(function(response) {
            if(response && response.length > 0) {
                sn.renderNotes(response);
            }
        });

}

IADAStickyNotes.prototype.saveNote = function(note_element) {
    var note = $(note_element);
    var new_note = false;
    var textarea = note.find('textarea');

    if(textarea.val() == '') {
        return;
    }

    if(typeof(note.attr('id')) == 'undefined') {
        //new note
        new_note = true;
        var url = this.options.backend_url + '/' + this.options.resource + '/' + this.options.resource_id + '/new.json';
        var method = 'POST';
    } else {
        //old note
        var url = this.options.backend_url + '/' + note.attr('id').split('_')[1] + '.json';
        var method = 'PATCH';
    }
    note.find('img.ajax_wait').show();
    $.ajax({
        type: method,
        url: url,
        data: {
            sticky: {
                sticky_text: textarea.val(),
            },
        },
    }).fail(function(){
        window.log("Error saving");
    }).success(function(response) {
        if(new_note && response) {
            note.attr('id', 'note_' + response.id);
            note.find('p.created_at').text(response.created_at);
        }
        note.find('img.ajax_wait').hide();
        note.find('p.saved_notification').show();
    });
}

IADAStickyNotes.prototype.renderNotes = function(notes) {
    for(noteNr in notes) {
        current = notes[noteNr];
        this.renderNote(current);
    }
}

IADAStickyNotes.prototype.bindControls = function() {
	var sn = this;
	$('button.new-sticky').on('click', function() { sn.newNote(); });
}

IADAStickyNotes.prototype.newNote = function() {
    var note = this.defaultNote;
    note.author = this.options.current_author;
    today = new Date();
    note.created_at = today.customFormat('#DD#-#MM#-#YYYY#');
    this.renderNote(note);
}

IADAStickyNotes.prototype.renderNote = function(note_obj) {
	var sn = this;
    var temp = $("#note-template").html();
    var note = $("<div class='note'></div>").html(temp);
    var textarea = note.find('textarea');

    // add id
    if(note_obj.id != null) {
        note.attr('id', 'note_' + note_obj.id);
    } else {
        note.addClass('new_note');
        textarea.attr('placeholder', this.options.placeholder);
    }

    note.find('p.author').text(note_obj.author.name);
    note.find('p.created_at').text(note_obj.created_at);

    // Bind sticky events
    note.find('a.delete-button').on('click', function(){ sn.deleteNote(this); });

    textarea.val(note_obj.sticky_text);
    textarea.on('blur', function(){ sn.afterNoteEdit(this); });
    textarea.on('focus', function(){ sn.uponNoteEdit(this); });
	note.find('a.save-button').on('click', function(){ sn.afterNoteEdit(this); });
	textarea.autosize();

    var innerNotesContainer = this.noteContainer.find('div.notes');
    innerNotesContainer.sortable({
        handle: "div.note-head",
        connectWith: ".notes",
        start: function(e, ui) {
            ui.placeholder.height(ui.item.outerHeight());
            ui.placeholder.width(ui.item.outerWidth());
        },
        stop: function(e, ui) {
            sn.afterNoteMove(ui);
        },
        placeholder: "ui-state-highlight",
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

}

IADAStickyNotes.prototype.afterNoteMove = function(ui) {
	var notes = this.noteContainer.find('div.notes div.note');
    var noteOrder = [];
    notes.each(function() {
        noteOrder.push($(this).attr('id').split('_')[1]);
    });

    $.ajax({
        type: 'PATCH',
        url: this.options.backend_url + '/' + this.options.resource + '/' + this.options.resource_id + '.json',
        data: {
            new_weight_ids: noteOrder,
        }
    }).fail(function(){
        window.log("Error updating note order");
    });
}

IADAStickyNotes.prototype.afterNoteEdit = function(element) {
    var note = $(element).parents('div.note');
    if(note.hasClass('focus')) {
        note.find('a.save-button').hide();
        var textarea = note.find('textarea');
        textarea.focus();

        this.saveNote(note);

        note.removeClass('focus');
    }
}

IADAStickyNotes.prototype.uponNoteEdit = function(element) {
    var note = $(element).parents('div.note');
    if(!note.hasClass('focus')) {
        note.addClass('focus');
        note.find('p.saved_notification').hide();
        note.find('a.save-button').show();
        var textarea = note.find('textarea');
        textarea.focus();
    }
}

IADAStickyNotes.prototype.deleteNote = function(element) {
    var note = $(element).parents('div.note');

    note.hide();

    if(typeof(note.attr('id')) != 'undefined') {
        var id = note.attr('id').split('_')[1];
        $.ajax({
            type: 'DELETE',
            url: this.options.backend_url + '/' + id + '.json',
        }).fail(function(){
            window.log("Error deleting note");
        });
    }

    note.remove();
}