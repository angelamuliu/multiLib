
// Gamecollection model
// Keeps track of all games as a collection

var Game = require("./game.js");

var game_collection = [];

exports.createGame = function(host_id) {
	var newGame = new Game(host_id);
	game_collection.push(newGame);
}

exports.getGame = function(host_id) {
	// Each game has a single host who is associated with it
	// so we can locate games by host_id
	for (var i=0; i<game_collection.length; i++) {
		var viewedGame = game_collection[i];
		if (viewedGame.host_id === host_id) {
			return viewedGame;
		}
	}
	return null;
}

exports.updateGame = function(updatedGame) {
	for (var i=0; i<game_collection.length; i++) {
		var viewedGame = game_collection[i];
		if (viewedGame.host_id === updatedGame.host_id) {
			game_collection[i] = updatedGame;
			return updatedGame;
		}
	}
	return null;
}

exports.deleteGame = function(host_id) {
	for (var i=0; i<game_collection.length; i++) {
		var viewedGame = game_collection[i];
		if (viewedGame.host_id === host_id) {
			game_collection.splice(i,1); // Remove 1 obj at position i
			return true;
		}
	}
	return false;
}

exports.getAllGames = function() {
	return game_collection;
}

// TODO: Process params into a game obj