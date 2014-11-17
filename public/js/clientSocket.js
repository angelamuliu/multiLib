var socket = io.connect('/');

socket.on('players', function (data) {
  $("#numPlayers").text(data.number);
  console.log(data.players);
  for (var i=0; i<data.players.length; i++) {
  	$("div#players").append("<p>"+ data.players[i] + "</p>");
  }
	});

socket.on('welcome', function (data) {
	console.log(data);
	$("p#welcome").text(data.message);
})