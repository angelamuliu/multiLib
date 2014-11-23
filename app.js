
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
var dbRoutes = require('./routes/dbRoutes.js');

// Load in the lib templates from the JSON file once when server starts
libModel.loadJSON(fs);

var game;
var host = null;
// not started | initializing | waiting for word
var gamestage = "not started";

io.sockets.on('connection', function (socket) {

	var player = playerCollection.createPlayer(socket.id);

	// Socket rooms: playing, host, viewLib_room
	socket.join('playing');

	// Disconnect automatically kicks the socket out of any rooms
	socket.on('disconnect', function () {
		playerCollection.deletePlayer(player);
		if (host === player) {
			host = null;
			game = null;
			gamestage = "not started";
			io.to('playing').emit('reset game');
		}
	});

	// ++++++++++++++++++++++
	// Setup the game and chores
	// ++++++++++++++++++++++

	// Would be called if the host wanted to stop midway
	socket.on('reset', function() {
		socket.leave('host');
		socket.join('playing');
		host = null;
		game = null;
		gamestage = "not started";
	});

	// A player has clicked a button to be host, update host and other player views
	socket.on('set host', function() {
		socket.join('host'); // Assign this socket to host
		socket.leave('playing');
		host = player;
		gameRoutes.prepGame(socket, libModel.getAllLibs());
		game = gameRoutes.createGame(socket, host);

		io.to('playing').emit('wait for host');
		gamestage = "initializing";
	})

	// Initialize game w/ host's chosen values, update views to main game view
	socket.on('Init Game', function(data) {
		gameRoutes.initGame(socket, game, data.gamename, data.libId, host, playerCollection.getAllPlayers(), libModel.getAllLibs());
		console.log(game.players_words);
		io.to('host').emit('render host view', {game: game});
		io.to('playing').emit('render player view', {game: game});
	});

	// ++++++++++++++++++++++
	// HOST sockets
	// ++++++++++++++++++++++

	socket.on('NOUN', function(data) {
		gamestage = "waiting for word";
		var slotposition = data.slotposition;
		io.to('host').emit('wait for word', {type: "NOUN", slotposition: slotposition, game: game});
		io.to('playing').emit('open word input', {type: "NOUN", slotposition: slotposition});
	})

	socket.on("ADJ", function(data) {
		gamestage = "waiting for word";
		var slotposition = data.slotposition;
		io.to('host').emit('wait for word', {type: "ADJ", slotposition: slotposition, game: game});
		io.to('playing').emit('open word input', {type: "ADJ", slotposition: slotposition});
	})

	// Host clicked on a player submitted word, time to move on!
	socket.on("choosen", function(data) {
		gameRoutes.chooseWord(io, socket, game, data.choosenword, data.slotposition, host, gamestage);
	})

	// ++++++++++++++++++++++
	// PLAYER sockets
	// ++++++++++++++++++++++

	// For players who enter in the middle of a game ...
	if (player !== host && host !== null) {
		console.log(host);
		if (gamestage = "initializing") {
			socket.emit('wait for host');
		} else if (gamestage = "waiting for word") {
			socket.emit('wait for host');
		}
	}

	socket.on('submitted word', function(data) {
		gameRoutes.addWord(socket, game, data.word);
		socket.emit('you submitted', {word: data.word});
		// Below: Emit event JUST to the host, whose id /socket.id is known
		io.to(host.getId()).emit('wait for word', {type: data.type, slotposition: data.slotposition, game:game});
	}) 

	// ++++++++++++++++++++++
	// MONGO sockets
	// ++++++++++++++++++++++

	// Change view to the lib viewer, loads libs in the mongoDB
	socket.on('load libs', function() {
		socket.join('viewLib_room');
		socket.leave('playing');
		gameRoutes.renderMongo(socket);
	})

	// Player has left the lib view, reenter as a possible player
	socket.on('leave libs', function() {
		socket.leave('viewLib_room');
		socket.join('playing');
		// Game in progress, render a waiting view
		if (player !== host && host !== null) {
			console.log("in progress");
			if (gamestage = "initializing") {
				socket.emit('wait for host');
			} else if (gamestage = "waiting for word") {
				socket.emit('wait for host');
			}
		} else {
			// No game in progress, rerender the home page
			socket.emit('reload lobby');
		}
	})



})

app.get("/", gameRoutes.renderLobby);





