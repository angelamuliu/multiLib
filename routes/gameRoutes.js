
var playerModel = require("../models/player.js");
var Game = require("../models/game.js");
var game;

exports.renderLobby = function(req, res) {
	res.render("game/game_lobby");
}

// Host is given this event to set up initial game values
exports.prepGame = function(socket, libs) {
	socket.emit('setup game', {libs: libs});
}

// Create a default game
exports.createGame = function(socket, host) {
	console.log("CREATE!");
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

exports.removeGame = function(socket, player_id) {
	var game = null;
}