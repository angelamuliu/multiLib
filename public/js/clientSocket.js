
var socket = io.connect('/');

function setHost() {
	socket.emit('set host', {username: localStorage.getItem("username")});
}

function viewLibs() {
	socket.emit('load libs');
}

function returnHome() {
	socket.emit('leave libs');
}

// Just reload the lobby
socket.on('reload lobby', function(data) {
	$("div#record").empty();
	$("div#record").append(homeNode);
	userEnter();
})

// Update UI for connected players IF a game is reset due to disconnected 
// or left host
socket.on('reset game', function(data) {
	$("div#record").empty();
	$("div#record").append("<div class=\"notif\">The game host disappeared! Sorry about that. Someone pick up the ball!</div>");
	$("div#record").append(homeNode);
	userEnter();
})

// A game has been completed
socket.on('finished game', function(data) {
	$("div#record").empty();
	$("div#record").append("<div class=\"completed\"></div>");
	$("div.completed").append("<h2>Check out the finished lib!</h2>");
	$("div.completed").append("<p>"+data.completeLib+"</p>");
	$("div#record").append(homeNode);
	userEnter();
	socket.emit('reset');
})

// -------------------------------------------------
// HOST SOCKETS
// -------------------------------------------------

// HOST: When a host is selected, render a form for game setup
socket.on('setup game', function(data) {
	$("div#record").empty();

	$("div#record").append("<h1>Setup the game</h1>");
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

	var bodySoFar = ""; // Keep track of body while we go through it so we can pass it in later to another fn...
	for (var i=0; i<data.game.lib_body.length; i++) {
		var wordseg = data.game.lib_body[i];
		if (wordseg[0] === "$") {
			// Is a word slot, make button w/ id of type and position in lib array
			$("div#record p").append("<button id=\""+ i + wordseg.slice(1) + "\" class=\"slot\"></button>");
			$("div#record p button").last().append(wordseg.slice(1));
			bodySoFar = bodySoFar + wordseg.slice(1);
		} else {
			$("div#record p").append(wordseg);
			bodySoFar = bodySoFar + wordseg;
		}
	}
	// Attach click handlers to the slot buttons, and sockets that relate to type of button
	$("div#record button").click( function() {
		var slotposition = $(this).attr('id')[0];
		var type = $(this).attr('id').slice(1);
		socket.emit('slot handler', {type: type, slotposition: slotposition, body: bodySoFar});
	})
})

// HOST: Start a timer and wait for words from other players
socket.on('wait for word', function(data) {
	$("div#record").empty();
	$("div#record").append("<img class=\"roboimg\" src=\"images/robo_hostChooseLib.png\"/>");
	$("div#record").append("<p>Waiting for </p>");
	$("div#record p").append("<h2>"+data.type+"</h2>");
	$("div#record p").append(" words from players...");

	$("div#record").append("<p>Story so far: "+data.body+"</p><hr />");

	$("div#record").append("<div id=\"inputwords\">Words so far:<br /></div>");
	if (data.game.players_words.length <1) {
		$("div#inputwords").append("No words have come in yet.");
	} else {
		for (var i=0; i<data.game.players_words.length; i++) {
			$("div#inputwords").append("<button class=\"choosen slideUp\">"+data.game.players_words[i]+"</button>");
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
socket.on('wait for host', function(data) {
	$("div#record").empty();
	if (data.hostname) {
		$("div#record").append("<p>Waiting for "+data.hostname+" to setup game...</p>");
	} else {
		$("div#record").append("<p>Waiting for host to setup game...</p>");
	}
	$("div#record p").append("<br /><i class=\"fa fa-spin fa-cog fa-3x\"></i>");

})

// PLAYER: Create the main mad lib game interface, player view
socket.on('render player view', function(data) {
	$("div#record").empty();
	$("div#record").append("<img class=\"slideUp roboimg\" src=\"images/robo_hostChooseLib.png\"/>");
	if (data.hostname) {
		$("div#record").append("<p>Waiting for "+data.hostname+" to select a word slot...Just wait a little longer.</p>");
	} else {
		$("div#record").append("<p>Waiting for host to select a word slot...Just wait a little longer.</p>");
	}
	$("div#record p").append("<br /><i class=\"fa fa-spin fa-cog fa-3x\"></i>");
})

// PLAYER: Update UI to allow word input
socket.on('open word input', function(data) {
	$("div#record").empty();
	$("div#record").append("<img class=\"slideUp roboimg\" src=\"images/robos_giveWords.png\"/>");
	$("div#record").append("<p>The host is asking for a " + data.type + "! Toss a word in!</p>");
	$("div#record").append("<input type=\"text\" name=\"playerinput\">");
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
		$("div#record").append("<img class=\"roboimg\" src=\"images/robos_giveWords.png\"/>");
	$("div#record").append("<p>You submitted the word " + data.word + ", waiting for other players now...</p>");
})


// -------------------------------------------------
// MONGO DB SOCKETS
// -------------------------------------------------

// Libs done loading from mongo, let's render them in a neat fashion
socket.on('libs done', function(data) {
	$("div#record").empty();
	$("div#record").append("<div class=\"lib_container\"></div>");

	if (data.libs.length === 0) {
		$("div#record").append("<p>There are no libs saved.</p>");
		$("div#record").append(libNode);
	} else {
		for (var i=0; i<data.libs.length; i++) {
			var viewedLib = data.libs[i];
			$("div.lib_container").append("<div class=\"completed\"><strong>"+viewedLib.name+"</strong><p>"+viewedLib.libstr+"</p></div>");
			// Attach a button whos id corresponds with the lib
			$("div.completed").last().append("<button class=\"delete\" id=\"" + viewedLib._id + "\">Delete</button>");
		}
		$("div#record").append(libNode);

		// Attach a click handler for the buttons to delete each lib
		$("div.lib_container button").click( function() {
			var id = $(this).attr("id");
			socket.emit('remove lib', {lib_id: id});
		})
	}
})



