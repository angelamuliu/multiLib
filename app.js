
// npm install -g nodemon
var express = require("express");
var morgan = require('morgan');
var http = require('http');
var app = express();
var sio = require('socket.io');
app.use(morgan('tiny'));

// Other modules
var fs = require('fs');

// -------------------------------------------------

// Set view directory
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');

// Handle static files
app.use(express.static(__dirname + '/public'));

// Hook up socket io
var httpServer = http.Server(app);
var io = sio(httpServer);
httpServer.listen(50000, function() {console.log('Listening on 50000');});

// -------------------------------------------------
// ROUTES / SOCKETIO

var libModel = require('./models/lib.js');
var gameRoutes = require('./routes/gameRoutes.js');
var playerCollection = require('./models/playercollection.js');

// Load in the lib templates from the JSON file once when server starts
libModel.loadJSON(fs);

var playerCount = 0;
var game;
var host;
var ingame = false;

io.sockets.on('connection', function (socket) {

	playerCount += 1;
	console.log(playerCount);
	var player = playerCollection.createPlayer(socket.id);

	// First player to connect can setup the game and is set as the host
	if (playerCount === 1) {
		gameRoutes.prepGame(socket, libModel.getAllLibs());
		host = player;
		game = gameRoutes.createGame(socket, host);
	}

	socket.on('disconnect', function () {
		playerCount -= 1;
		playerCollection.deletePlayer(player);
		if (host === player) {
			// Reassign who is host
			host = playerCollection.getAllPlayers[0];
			gameRoutes.removeGame(socket, player.getId());
		}
	});

	socket.on('Create Game', function(data) {
		ingame = true;
		gameRoutes.initGame(socket, game, data.gamename, data.libId, host, playerCollection.getAllPlayers(), libModel.getAllLibs());
		socket.emit('render host view', {game: game});
		socket.broadcast.emit('render player view', {game: game});
	});

	socket.on('remove game', function() {
		gameRoutes.removeGame(socket, player.getId());
	});

	socket.on('NOUN', function() {
		console.log("NOUN");
	})

	socket.on("ADJ", function() {
		console.log("ADJ");
	})

})


app.get("/", gameRoutes.renderLobby);





