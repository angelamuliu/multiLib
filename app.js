
// npm install -g nodemon
var express = require("express");
var morgan = require('morgan');
var http = require('http');
var app = express();
var sio = require('socket.io');
app.use(morgan('tiny'));

// Other modules
var fs = require('fs');
console.log("Modules done");
// -------------------------------------------------

// Set view directory
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');

// Handle static files
app.use(express.static(__dirname + '/public'));

// Hook up socket io
var httpServer = http.Server(app);
var io = sio(httpServer);

// Start server, default to localhost if openshift not found
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 50000;
httpServer.listen(port, ipaddress, function() {console.log('Node server started on %s:%d', ipaddress, port);});

// -------------------------------------------------
// ROUTES / SOCKETIO
console.log("Attempt load");
var libModel = require('./models/lib.js');
var gameRoutes = require('./routes/gameRoutes.js');
var playerCollection = require('./models/playercollection.js');

// Load in the lib templates from the JSON file once when server starts
libModel.loadJSON(fs);
// Initialize mongoDB
console.log("Attept");
gameRoutes.mongoinit();

// Variables kept track per app
var game;
var body = ""; // The lib's string body
var host = null;
var hostname = "";

// not started | initializing | waiting for word
var gamestage = "not started";

io.sockets.on('connection', function (socket) {

	var player = playerCollection.createPlayer(socket.id);

	// Socket rooms: playing, host, viewLib_room
	socket.join('playing');
	socket.emit('reload lobby');

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
		hostname = "";
		game = null;
		gamestage = "not started";
	});

	// A player has clicked a button to be host, update host and other player views
	socket.on('set host', function(data) {
		socket.join('host'); // Assign this socket to host
		socket.leave('playing');
		host = player;
		gameRoutes.prepGame(socket, libModel.getAllLibs());
		game = gameRoutes.createGame(socket, host);
		gamestage = "initializing";
		if (data.username) {
			hostname = data.username;
			io.to('playing').emit('wait for host', {hostname:hostname});
		} else {
			io.to('playing').emit('wait for host');
		}
	})

	// Initialize game w/ host's chosen values, update views to main game view
	socket.on('Init Game', function(data) {
		gameRoutes.initGame(socket, game, data.gamename, data.libId, host, playerCollection.getAllPlayers(), libModel.getAllLibs());
		io.to('host').emit('render host view', {game: game});
		if (hostname) { io.to('playing').emit('render player view', {game: game, hostname:hostname});
		} else {
			io.to('playing').emit('render player view', {game: game});
		}
	});

	// ++++++++++++++++++++++
	// HOST sockets
	// ++++++++++++++++++++++

	// Used to respond to when host presses a word slot. This makes sure that the position the slot is associated with is
	// properly filled, and also has word type information to pass to everyone so people know what to submit
	socket.on('slot handler', function(data) {
		gamestage = "waiting for word";
		var slotposition = data.slotposition;
		body = data.body;
		switch (data.type) {
			case 'NOUN': 	io.to('host').emit('wait for word', {type: "NOUN", slotposition: slotposition, game: game, body:body});
							io.to('playing').emit('open word input', {type: "NOUN", slotposition: slotposition});
							break;
			case 'P_NOUN': 	io.to('host').emit('wait for word', {type: "PROPER NOUN", slotposition: slotposition, game: game, body:body});
							io.to('playing').emit('open word input', {type: "PROPER NOUN", slotposition: slotposition});
							break;
			case 'ADJ': 	io.to('host').emit('wait for word', {type: "ADJECTIVE", slotposition: slotposition, game: game, body:body});
							io.to('playing').emit('open word input', {type: "ADJECTIVE", slotposition: slotposition});
							break;
			case 'VERB': 	io.to('host').emit('wait for word', {type: "VERB", slotposition: slotposition, game: game, body:body});
							io.to('playing').emit('open word input', {type: "VERB", slotposition: slotposition});
							break;		
		}
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
		io.to(host.getId()).emit('wait for word', {type: data.type, slotposition: data.slotposition, game:game, body:body});
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
			if (gamestage === "initializing" || gamestage === "waiting for word") {
				if (hostname) {
					socket.emit('wait for host', {hostname: hostname});
				} else {
					socket.emit('wait for host');
				}
			}
		} else {
			// No game in progress, rerender the home page
			socket.emit('reload lobby');
		}
	})

	socket.on('remove lib', function(data) {
		gameRoutes.deleteLib(io, data.lib_id);
	})



})

app.get("/", gameRoutes.renderLobby);





