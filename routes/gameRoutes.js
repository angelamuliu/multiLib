
var playerModel = require("../models/player.js");
var Game = require("../models/game.js");
var mongo = require('../models/mongo.js');

exports.renderLobby = function(req, res) {
	res.render("game/game_lobby");
}

// Host is given this event to set up initial game values
exports.prepGame = function(socket, libs) {
	socket.emit('setup game', {libs: libs});
}

// Create a default game
exports.createGame = function(socket, host) {
	game = new Game(host.getId());
	return game;
}

// Called after values have been validated clientside, initialize game
exports.initGame = function(socket, game, name, libId, host, players, libs) {
	game.updateName(name);
	game.updateLib(libId);
	game.updateLibBody(libs[game.getLibId()].body);
	for (var i=0; i<players.length; i++) {
		game.addPlayer(players[i].getId());
	}
}

// A player has suggested a word for the host
exports.addWord = function(socket, game, word) {
	game.addPlayerWord(word);
}

// Host has chosen a word, now let's update the game and views!
exports.chooseWord = function(socket, game, word, slotposition) {
	// Update the lib body array
	var updated_libBody = game.getLibBody();
	updated_libBody[slotposition] = word;
	game.updateLibBody(updated_libBody);
	// Clear game player submitted words array for next round!
	game.clearPlayerWords();
	if (game.emptySlots_inLibBody()) {
		socket.emit('render host view', {game: game});
		socket.broadcast.emit('render player view', {game: game});
	} else {
		// No more empty slots, the game is OVER! Save result to mongo
		// and render a finished screen for players somehow
		console.log("DONE!");
		game.processLibBody();
		mongo.insert(game.getName(), game.getLibStr(), game.getLibId(), 
			function() {
				console.log("INSERTED!");
		});
	}
}