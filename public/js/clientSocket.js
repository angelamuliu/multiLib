var socket = io.connect('/');
socket.on('players', function (data) {
  console.log(data);
  $("#numPlayers").text(data.number);
	});

socket.on('welcome', function (data) {
	console.log(data);
	$("p#welcome").text(data.message);
})