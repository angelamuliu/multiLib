
var socket = io.connect('/');

function setHost() {
	socket.emit('set host');
}

// Update UI for connected players IF a game is reset due to disconnected 
// or left host
socket.on('reset game', function(data) {
	$("div#record").empty();
	$("div#record").append("<div class=\"notif\">The game host disappeared! Sorry about that. Someone pick up the ball!</div>");
	$("div#record").append(homeNode);
})

// -------------------------------------------------
// HOST SOCKETS
// -------------------------------------------------

// HOST: When a host is selected, render a form for game setup
socket.on('setup game', function(data) {
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
    	  socket.emit('Init Game', {gamename: gamename, libId: libId});
    	}
  	})
})

// HOST: Create the main mad lib game interface, host view
socket.on('render host view', function(data) {
	$("div#record").empty();
	$("div#record").append("<h3>" + data.game.name + "</h3>");
	$("div#record").append("<p></p>");
	for (var i=0; i<data.game.lib_body.length; i++) {
		var wordseg = data.game.lib_body[i];
		if (wordseg[0] === "$") {
			// Is a word slot, make button w/ id of type and position in lib array
			$("div#record p").append("<button id=\""+ i + wordseg.slice(1) + "\" class=\"slot\"></button>");
			$("div#record p button").last().append(wordseg.slice(1));
		} else {
			$("div#record p").append(data.game.lib_body[i]);
		}
	}
	// Attach click handlers to the slot buttons, and sockets that relate to type of button
	$("div#record button").click( function() {
		var slotposition = $(this).attr('id')[0];
		var type = $(this).attr('id').slice(1);
		socket.emit(type, {slotposition: slotposition});
	})
})

// HOST: Start a timer and wait for words from other players
socket.on('wait for word', function(data) {
	$("div#record").empty();
	$("div#record").append("<p>Waiting for </p>");
	$("div#record p").append("<h2>"+data.type+"</h2>");
	$("div#record p").append(" words from players...");

	$("div#record").append("<div id=\"inputwords\">Words so far:<br /></div>");
	if (data.game.players_words.length <1) {
		$("div#inputwords").append("No words have come in yet.");
	} else {
		for (var i=0; i<data.game.players_words.length; i++) {
			$("div#inputwords").append("<button class=\"choosen\">"+data.game.players_words[i]+"</button>");
			// $("div#inputwords").append("<p>"+data.game.players_words[i]+"</p>");
		}
	}
	// Attach click handlers to player word input buttons
	$("div#inputwords button").click( function() {
		var input = $(this).text();
		socket.emit("choosen", {slotposition: data.slotposition, choosenword: input});
	})
})

// -------------------------------------------------
// PLAYER SOCKETS
// -------------------------------------------------

// PLAYER: A general waiting page for nonhost players, waiting for the host to make choices
socket.on('wait for host', function() {
	$("div#record").empty();
	$("div#record").append("<p>Waiting for host</p>");
})

// PLAYER: Create the main mad lib game interface, player view
socket.on('render player view', function(data) {
	$("div#record").empty();
	$("div#record").append("<p>Host has choosen a lib. Keep on waiting.</p>");
})

// PLAYER: Update UI to allow word input
socket.on('open word input', function(data) {
	$("div#record").empty();
	$("div#record").append("The host is asking for a " + data.type + "! ");
	$("div#record").append("Toss a word in! <input type=\"text\" name=\"playerinput\">");
	$("div#record").append("<button id=\"submit_word\">Go!</button>");
	$("button#submit_word").click( function() {
		var input = $("input[name=playerinput]").val();
		if (input !== "") {
			socket.emit('submitted word', {word: input, type: data.type, slotposition: data.slotposition});
		}
	}) 
})

// PLAYER: Just submitted a word, now waiting for other users
socket.on('you submitted', function(data) {
	$("div#record").empty();
	$("div#record").append("You submitted the word " + data.word + ", waiting for other players now...");
})


// -------------------------------------------------
// MONGO DB SOCKETS
// -------------------------------------------------







