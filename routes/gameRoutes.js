
var playerModel = require("../models/player.js");
var gameModel = require("../models/game.js");
var game;

exports.renderLobby = function(req, res) {
	res.render("game/game_lobby");
}

exports.prepGame = function(socket, libs) {
	console.log("?????");
	socket.emit('setup game', {libs: libs});
}

exports.createGame = function(socket, name, libId, host, players) {
	console.log("CREATE!");
	game = new Game(host.getId());
	game.updateName(name);
	game.updateLib(libId);
	for (var i=0; i<players.length; i++) {
		game.addPlayer(players[i].getId());
	}
}

exports.removeGame = function(socket, player_id) {
	gameCollection.deleteGame(player_id);
	var games = gameCollection.getAllGames();
	socket.broadcast.emit('update game list', {games: games});
}
