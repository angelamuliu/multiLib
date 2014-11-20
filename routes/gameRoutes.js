
var gameCollection = require("../models/gamecollection.js");

exports.renderLobby = function(req, res) {
	var games = gameCollection.getAllGames();
	res.render("game/game_lobby", {"games" : games});
}

exports.prepGame = function(req, res) {
	var prepGame = gameCollection.getNewestGame();
	res.render("game/make_game");
}

exports.refreshList = function(socket) {
	var games = gameCollection.getAllGames();
	socket.emit('update game list', {games: games});
	socket.broadcast.emit('update game list', {games: games});
}

exports.createGame = function(socket, player_id) {
	gameCollection.createGame(player_id);
	var games = gameCollection.getAllGames();
	socket.broadcast.emit('update game list', {games: games});
}

exports.removeGame = function(socket, player_id) {
	gameCollection.deleteGame(player_id);
	var games = gameCollection.getAllGames();
	socket.broadcast.emit('update game list', {games: games});
}

exports.update_setupgame = function(socket, player_id, data) {
	console.log(player_id);
	var currgame = gameCollection.getGame(player_id);
}

exports.init = function(io) {
io.sockets.on('connection', function (socket) {
	socket.broadcast.emit('update game list', {games: gameCollection.getAllGames()});


	// During game setup, push changes so everyone can see
	socket.on("setup: update game", function(data) {
		console.log(player_id);
		var currgame = gameCollection.getGame(player_id);
		currgame.updateName(data.name);
		currgame.updateLib(data.lib);
		socket.broadcast.emit('update game list', {games: gameCollection.getAllGames()});
	})
})
}