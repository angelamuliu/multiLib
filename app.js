
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
var dbRoutes = require('./routes/dbRoutes');

// Load in the lib templates from the JSON file once when server starts
libModel.loadJSON(fs);

var game;
var host = null;
// not started | initializing | waiting for word
var gamestage = "not started";

io.sockets.on('connection', function (socket) {

	var player = playerCollection.createPlayer(socket.id);

	socket.on('disconnect', function () {
		playerCollection.deletePlayer(player);
		if (host === player) {
			host = null;
			game = null;
			gamestage = "not started";
			socket.broadcast.emit('reset game');
		}
	});

	// ++++++++++++++++++++++
	// Setup the game and chores
	// ++++++++++++++++++++++

	// Would be called if the host wanted to stop midway
	socket.on('reset', function() {
		console.log("RESET THE GAME");
		host = null;
		game = null;
		gamestage = "not started";
	});

	// A player has clicked a button to be host, update host and other player views
	socket.on('set host', function() {
		host = player;
		gameRoutes.prepGame(socket, libModel.getAllLibs());
		game = gameRoutes.createGame(socket, host);
		socket.broadcast.emit('wait for host');
		gamestage = "initializing";
	})

	// Initialize game w/ host's chosen values, update views to main game view
	socket.on('Init Game', function(data) {
		gameRoutes.initGame(socket, game, data.gamename, data.libId, host, playerCollection.getAllPlayers(), libModel.getAllLibs());
		console.log(game.players_words);
		socket.emit('render host view', {game: game});
		socket.broadcast.emit('render player view', {game: game});
	});

	// ++++++++++++++++++++++
	// HOST sockets
	// ++++++++++++++++++++++

	socket.on('NOUN', function(data) {
		gamestage = "waiting for word";
		var slotposition = data.slotposition;
		socket.emit('wait for word', {type: "NOUN", slotposition: slotposition, game: game});
		socket.broadcast.emit('open word input', {type: "NOUN", slotposition: slotposition});
	})

	socket.on("ADJ", function(data) {
		gamestage = "waiting for word";
		var slotposition = data.slotposition;
		socket.emit('wait for word', {type: "ADJ", slotposition: slotposition, game: game});
		socket.broadcast.emit('open word input', {type: "ADJ", slotposition: slotposition});
	})

	// Host clicked on a player submitted word, time to move on!
	socket.on("choosen", function(data) {
		gameRoutes.chooseWord(socket, game, data.choosenword, data.slotposition, host, gamestage);
	})

	// ++++++++++++++++++++++
	// PLAYER sockets
	// ++++++++++++++++++++++

	// For players who enter in the middle of a game ...
	if (player !== host && host !== null) {
		console.log(host);
		if (gamestage = "initializing") {
			console.log("initializing");
			socket.emit('wait for host');
		} else if (gamestage = "waiting for word") {
			console.log("waiting for word");
			socket.emit('wait for host');
		}
	}

	socket.on('submitted word', function(data) {
		gameRoutes.addWord(socket, game, data.word);
		socket.emit('you submitted', {word: data.word});
		// Below: Emit event JUST to the host, whose id /socket.id is known
		io.to(host.getId()).emit('wait for word', {type: data.type, slotposition: data.slotposition, game:game});
	}) 

})

app.get("/", gameRoutes.renderLobby);

app.get("/:collection/:operation", dbRoutes.mongo);





