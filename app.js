
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


io.sockets.on('connection', function (socket) {
	playerCount += 1;

	// First player to connect can setup the game
	if (playerCount === 1) {
		gameRoutes.prepGame(socket, libModel.getAllLibs());
	} else {
		gameRoutes.connectToGame(socket);
	}

	var player = playerCollection.createPlayer(socket.id);

	socket.on('disconnect', function () {
		playerCount -= 1;
		playerCollection.deletePlayer(player);
	});

	socket.on('create game', function() {
		console.log(player.getId());
		gameRoutes.createGame(socket, player.getId());
	});

	socket.on('remove game', function() {
		gameRoutes.removeGame(socket, player.getId());
	});

	socket.on("setup: update game", function(data) {
		gameRoutes.update_setupgame(socket, player.getId(), data);
	})

})





app.get("/", gameRoutes.renderLobby);
app.get("/makeGame", gameRoutes.prepGame);





