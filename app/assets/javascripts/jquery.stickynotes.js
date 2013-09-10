IADAStickyNotes.prototype.options = null;
IADAStickyNotes.prototype.noteContainer = null;

IADAStickyNotes.prototype.defaultNote = {
        id: null,
        sticky_text: 'Text',
        author: {author_id: 0, author_name: ''},
        weight: 0,
        created_at: '',
}

function IADAStickyNotes(options) {

    this.options = Object.extend({
        container: 'note-container',
        backend_url: 'url to backend',
        current_author: { author_id: 0, author_name: 'Name' },
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
            url: this.options.backend_url + '.json',
        }).fail(function(){
            window.log("Error getting notes");
        }).success(function(response) {
            if(response.length > 0) {
                sn.renderNotes(response.stickies);
            }
        });

}

IADAStickyNotes.prototype.saveNote = function(note_obj) {
    $.ajax({
        type: 'POST',
        url: this.options.backend_url + '/' + note_obj.id + '.json',
        data: {
            sticky: note_obj,
        },
    }).fail(function(){
        window.log("Error saving");
    }).success(function(response) {
        if(response.stickies.length > 0) {
            sn.notes = reponse.stickies;
            sn.renderNotes();
        }
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
    note.text = this.options.placeholder;
    note.author = this.options.current_author;
    today = new Date();
    note.created_at = today.customFormat('#DD#-#MM#-#YYYY#');
    this.renderNote(note);
}


IADAStickyNotes.prototype.renderNote = function(note_obj) {
	var sn = this;
    var temp = $("#note-template").html();
    var note = $("<div class='note'></div>").html(temp);

    // add id
    if(note_obj.id != null) {
    	note.attr('id', 'note_' + note_json_note.id);
    } else {
    	note.addClass('new_note');
    }

    note.find('p.author').text(note_obj.author.author_name);
    note.find('p.created_at').text(note_obj.created_at);

    // Bind sticky events
    note.find('a.delete-button').on('click', function(){ sn.deleteNote(this); });

    var textarea = note.find('textarea');
    textarea.val(note_obj.text);
    textarea.on('blur', function(){ sn.afterNoteEdit(this); });
	note.find('a.save-button').on('click', function(){ sn.afterNoteEdit(this); });
	textarea.autogrow();

    var innerNotesContainer = this.noteContainer.find('div.notes');
    innerNotesContainer.sortable({
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

    innerNotesContainer.append(note);

    // Focus on new note
    if(note_obj.id == null) {
        textarea.focus();
        textarea.select();
        note.find('a.save-button').show();
    }

}

IADAStickyNotes.prototype.afterNoteMove = function(ui) {
	console.debug('Update stickynote position');
}

IADAStickyNotes.prototype.afterNoteEdit = function(element) {
    var note = $(element).parents('div.note');
    note.find('a.save-button').hide();
    var textarea = note.find('textarea');
    //textarea.unfocus();
	console.debug('Update stickynote text');
}

IADAStickyNotes.prototype.deleteNote = function(element) {
    $(element).parents("div.note").remove();
}