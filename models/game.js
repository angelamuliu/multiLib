
// Game model

// -------------------------------------------------

var game_collection = [];

// A game object NEEDS a host_id, everything else initialized
function Game(host_id) {
	this.host_id = host_id;
	this.name = "";
	this.players = [];
	this.lib_id = 0;
	this.lib_str = ""; // Final pieced together lib
	this.lib_body = []; // Segmented lib
	this.current_word = "";
	this.players_words = [];
}

// Game CRUD
// exports.functionname > Generalizable game methods called by...
// var Game = require("./game.js");
// Game.createGame

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


// -------------------------------------------------

// Individual game
// These are used on specific instances of game

Game.prototype.addPlayer = function(player_id) {
	this.players.push(player_id);
}

Game.prototype.removePlayer = function(player_id) {
	for (var i = 0; i < this.players.length; i++) {
		if (player_id === this.players[i].player_id) {
			this.players.splice(i, 1);
			return true;
		}
	}
	return false;
}

Game.prototype.updateName = function(name) {
	this.name = name;
}

Game.prototype.updateLib = function(lib_id) {
	this.lib_id = lib_id;
}

Game.prototype.updateLibStr = function(lib_str) {
	this.lib_str = lib_str;
}

Game.prototype.updateLibBody = function(lib_body) {
	this.lib_body = lib_body;
}

Game.prototype.updateCurrWord = function(newWord) {
	this.current_word = newWord;
}

Game.prototype.addPlayerWord = function(playerWord) {
	this.players_words.push(playerWord);
}

Game.prototype.clearPlayerWords = function() {
	this.players_words = [];
}

module.exports = Game;


