var Player = require("../models/player.js");
var playerCollection = require("../models/playercollection.js");
var Game = require("../models/game.js");
var gameCollection = require("../models/gamecollection.js");

exports.init = function(io) {
io.sockets.on('connection', function (socket) {

	// Register the player
	playerCollection.createPlayer(socket.id);
	var players = playerCollection.getAllPlayers();
	// Load in existing games
	var games = gameCollection.getAllGames();
	socket.emit('update game list', {games:games});
	socket.broadcast.emit('update game list', {games:games});

	socket.on('disconnect', function () {
		playerCollection.deletePlayer(socket.id);
	});



	socket.on('create game', function() {
		console.log("CREATING A GAME");
		gameCollection.createGame(socket.id);
		var games = gameCollection.getAllGames();
		console.log(games);
		socket.broadcast.emit('update game list', {games: games});
	});

	socket.on('remove game', function() {
		gameCollection.deleteGame(socket.id);
		var games = gameCollection.getAllGames();
		socket.broadcast.emit('update game list', {games: games});
	})


});
}
