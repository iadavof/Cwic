IADAStickyNotes.prototype.options = null;
IADAStickyNotes.prototype.notes = [];

function IADAStickyNotes(options) {

    this.options = Object.extend({
    	resource_name: 'resource',
    	resource_id: 0,
    }, options || {});

    this.bindControls();
}

IADAStickyNotes.prototype.bindControls = function() {
	var sn = this;
	$('button.new-sticky').on('click', function() { sn.newNote(); });
}

IADAStickyNotes.prototype.newNote = function() {
	var sn = this;
    var temp = $("#note-template").html();
    var note = $("<div class='note'></div>").html(temp);
	
    note.css({position: 'absolute', left: '20px', top: '50px'});

    // Bind sticky events
	note.find('div.delete-button').on('click', function(){ sn.deleteNote(this); });
	var textarea = note.find('textarea');
	textarea.blur(function(){ sn.afterNoteEdit(); });
	textarea.autogrow();
	textarea.resizable({minWidth: parseInt(textarea.css('min-width')), minHeight: parseInt(textarea.css('min-height'))});


	note.appendTo("body");
	//make draggable
	note.draggable();

}

note = {
	note_id: null,
	text: 'lablablalblalba',
	author: '',
	pos_x: 10,
	posy: 10,
	width: 0,
	height: 0,

}

IADAStickyNotes.prototype.renderNote = function(note_json) {
	var sn = this;
    var temp = $("#note-template").html();
    var note = $("<div class='note'></div>").html(temp);

    // add id
    if(note_json.note_id != null) {
    	note.attr('id', 'note_' + note_json_note.id);
    } else {
    	note.addClass('new_note');
    }
	
    note.css({ position: 'absolute' });
    if(note_json.pos_x > 0) {
    	note.css('left', note_json.pos_x + '%');
    } else {
    	note.css('left', '5%');
    }
    if(note_json.pos_y > 0) {
    	note.css('top', note_json.pos_y + '%');
    } else {
    	note.css('top', '5%');
    }

	var textarea = note.find('textarea');
    
    if(note_json.width > textarea.css('min-width')) {
    	textarea.css('width', note_json.width + 'px');
    }
    if(note_json.height > textarea.css('min-height')) {
    	textarea.css('height', note_json.height + 'px');
    }

    // Bind sticky events
	note.find('div.delete-button').on('click', function(){ sn.deleteNote(this); });
	textarea.on('blur', function(){ sn.afterNoteEdit(); });
	textarea.autogrow();
	textarea.resizable({stop: function(event, ui) { sn.afterNoteResize(ui); }, minWidth: parseInt(textarea.css('min-width')), minHeight: parseInt(textarea.css('min-height'))});

	note.appendTo("body");

	//make draggable
	note.draggable({stop: function(event, ui) { sn.afterNoteMove(ui); }});

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