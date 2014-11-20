var socket = io.connect('/');

socket.on('players', function (data) {
  $("#numPlayers").text(data.number);
  console.log(data.players);
  for (var i=0; i<data.players.length; i++) {
  	$("div#players").append("<p>"+ data.players[i] + "</p>");
  }
	});

socket.on('welcome', function (data) {
	$("p#welcome").text(data.message);
})

socket.on('update game list', function(data) {
	$("div#gamelist").empty();
	for (var i=0; i<data.games.length; i++) {
		$("div#gamelist").append("<p>" + data.games[i] + "</p>");
	}
})

$(document).ready(function() {

	$("#makeGame").click(function() {
		socket.emit("create game");
	})

});