IADAStickyNotes.prototype.options = null;
IADAStickyNotes.prototype.notes = [];

IADAStickyNotes.prototype.defaultNote = {
        id: null,
        sticky_text: 'Text',
        user_id: 0,
        pos_x: 10,
        pos_y: 10,
        width: 0,
        height: 0,
}

function IADAStickyNotes(options) {

    this.options = Object.extend({
        backend_url: 'url to backend',
        current_author: { author_id: 0, author_name: 'Name' },
    }, options || {});

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
                sn.notes = reponse.stickies;
                sn.renderNotes();
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

IADAStickyNotes.prototype.renderNotes = function() {
    for(noteNr in this.notes) {
        current = this.notes[noteNr];
        this.renderNote(current);
    }
}

IADAStickyNotes.prototype.bindControls = function() {
	var sn = this;
	$('button.new-sticky').on('click', function() { sn.newNote(); });
}

IADAStickyNotes.prototype.newNote = function() {
    var note = this.defaultNote;
    note.user_id = this.options.current_author.author_id;
    this.renderNote(this.defaultNote);
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
	
    if(note_obj.pos_x > 0) {
    	note.css('left', note_obj.pos_x + '%');
    } else {
    	note.css('left', '5%');
    }
    if(note_obj.pos_y > 0) {
    	note.css('top', note_obj.pos_y + '%');
    } else {
    	note.css('top', '5%');
    }

    
    if(note_obj.width > note.css('min-width')) {
        note.css('width', note_obj.width + 'px');
    }
    if(note_obj.height > note.css('min-height')) {
        note.css('height', note_obj.height + 'px');
    }

    // Bind sticky events
    note.find('div.delete-button').on('click', function(){ sn.deleteNote(this); });
	
    var textarea = note.find('textarea');
	textarea.on('blur', function(){ sn.afterNoteEdit(); });
	//textarea.autogrow();
	
    note.resizable({stop: function(event, ui) { sn.afterNoteResize(ui); }, minWidth: parseInt(note.css('min-width')), minHeight: parseInt(note.css('min-height'))});
    //make draggable
    note.draggable({containment: 'document', stop: function(event, ui) { sn.afterNoteMove(ui); }});

    note.appendTo("body");

}

IADAStickyNotes.prototype.afterNoteResize = function(ui) {
	console.debug('Update stickynote size');
}

IADAStickyNotes.prototype.afterNoteMove = function(ui) {
	console.debug('Update stickynote position');
}

IADAStickyNotes.prototype.afterNoteEdit = function() {
	console.debug('Update stickynote text');
}

IADAStickyNotes.prototype.deleteNote = function(element) {
    $(element).parents(".note").remove();
}

IADAStickyNotes.prototype.updateNoteInfo = function(note_element, noteid) {
    for(noteNr in this.notes) {
        current = this.notes[noteNr];
        if(current.id == noteid) {

            var notePercentPos = positionToPercentageDocument(note_element.position);

            current.pos_x = notePercentPos.x;
            current.pos_y = notePercentPos.x;
            current.width = note_element.width();
            current.height = note_element.height();

            return current;
        }
    }
    return null;
}

IADAStickyNotes.prototype.positionToPercentageDocument = function(position) {
    return {x: position.x.toFixed() / document.width() * 100.0, y: position.y.toFixed() / document.height() * 100.0};
}