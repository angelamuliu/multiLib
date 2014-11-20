var socket = io.connect('/');

socket.on('players', function (data) {
  $("#numPlayers").text(data.number);
  console.log(data.players);
  for (var i=0; i<data.players.length; i++) {
  	$("div#players").append("<p>"+ data.players[i] + "</p>");
  }
	});


socket.on('update game list', function(data) {
	console.log("Update!");
	$("div#gamelist").empty();
	for (var i=0; i<data.games.length; i++) {
		$("div#gamelist").append("<p>" + data.games[i].name + "</p>");
	}
})

$(document).ready(function() {

	$("#makeGame").click(function() {
		console.log("CREATE");
		socket.emit("create game");
	})

});