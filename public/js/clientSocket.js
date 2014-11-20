var socket = io.connect('/');

// Shown for first user, allows setup
socket.on('setup game', function(data) {
	console.log("setup");
	$("div#record").empty();
	$("div#record").append("<h1>Setup</h1>");
	$("div#record").append("Game name: <input type=\"text\" name=\"gamename\"><br/>");
	$("div#record").append("Select a lib: <select name=\"lib\">");
	for (var i=0; i<data.libs.length; i++) {
		$("div#record select").append("<option value=" + data.libs[i].id + ">" + data.libs[i].title + "</option>");
	}
	$("div#record").append("<button id=\"start\">Go!</button>");

	$("button#start").click( function() {
    	var gamename = $("input[name=gamename]").val();
    	var libId = $("select[name=lib]").val();
    	if (gamename !== "") {
    	  socket.emit('Create Game', {gamename: gamename, libId: libId});
    	}
  	})
})

socket.on('render host view', function(data) {
	$("div#record").empty();
	$("div#record").append("<h3>" + data.game.name + "</h3>");
	for (var i=0; i<data.game.lib_body.length; i++) {
		var wordseg = data.game.lib_body[i];
		if (wordseg[0] === "$") {
			// Is a word slot, make button w/ id of type and position in lib array
			$("div#record").append("<button id=\""+ i + wordseg.slice(1) + "\"></button>");
			$("div#record button").last().append(wordseg.slice(1));
		} else {
			$("div#record").append("<p>" + data.game.lib_body[i] + "</p>");
		}
	}
	// Attach click handlers to the slot buttons
	$("div#record button").click( function() {
		var position = $(this).attr('id')[0];
		var type = $(this).attr('id').slice(1);
		socket.emit(type, {slotposition: position});
	})
})