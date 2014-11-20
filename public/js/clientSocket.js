var socket = io.connect('/');

socket.on('update game list', function(data) {
	console.log("Update!");
	$("div#gamelist").empty();
	for (var i=0; i<data.games.length; i++) {
		$("div#gamelist").append("<p>" + data.games[i].name + "</p>");
	}
})

// Shown for first user, allows setup
socket.on('setup game', function(data) {
	$("div#record").empty();
	$("div#record").append("<h1>Setup</h1>");
	$("div#record").append("Game name: <input type=\"text\" name=\"gamename\"><br/>");
	$("div#record").append("Select a lib: <select name=\"lib\">");
	for (var i=0; i<data.libs.length; i++) {
		$("div#record select").append("<option value=" + data.libs[i].id + ">" + data.libs[i].title + "</option>");
	}
	$("div#record").append("<button>Go!</button>");
})


$(document).ready(function() {

	$("#makeGame").click(function() {
		console.log("CREATE");
		socket.emit("create game");
	})

});

