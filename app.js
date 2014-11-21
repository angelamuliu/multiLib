
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

var game;
var host;
var ingame = false;

io.sockets.on('connection', function (socket) {

	var player = playerCollection.createPlayer(socket.id);

	socket.on('disconnect', function () {
		playerCollection.deletePlayer(player);
		if (host === player) {
			// Reassign who is host
			host = playerCollection.getAllPlayers[0];
			game = null;
			ingame = false;
			socket.broadcast.emit('reset game');
		}
	});

	// Would be called if the host wanted to stop midway
	socket.on('remove game', function() {
		game = null;
		socket.broadcast.emit('reset game');
	});

	// A player has clicked a button to be host, update host and other player views
	socket.on('set host', function() {
		host = player;
		gameRoutes.prepGame(socket, libModel.getAllLibs());
		game = gameRoutes.createGame(socket, host);
		socket.broadcast.emit('wait for host');
		ingame = true;
	})

	// Initialize game w/ host's chosen values, update views to main game view
	socket.on('Init Game', function(data) {
		gameRoutes.initGame(socket, game, data.gamename, data.libId, host, playerCollection.getAllPlayers(), libModel.getAllLibs());
		socket.emit('render host view', {game: game});
		socket.broadcast.emit('render player view', {game: game});
	});

	// ++++++++++++++++++++++
	// HOST word slot sockets
	// ++++++++++++++++++++++

	socket.on('NOUN', function(data) {
		var slotposition = data.slotposition;
		socket.emit('wait for word', {type: "NOUN", slotposition: slotposition});
		socket.broadcast.emit('open word input', {type: "NOUN"});
	})

	socket.on("ADJ", function() {
		console.log("ADJ");
	})

	socket.on('submitted word', function(data) {
		console.log(data.word);
		gameRoutes.addWord(socket, game, data.word);
	}) 

})


app.get("/", gameRoutes.renderLobby);





