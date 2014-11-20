
// PlayerCollection model
// Keeps track of all players as a collection

var Player = require('./player.js');

var player_collection = [];

exports.createPlayer = function(player_id) {
	var newplayer = new Player(player_id);
	player_collection.push(newplayer);
	return newplayer;
}

exports.deletePlayer = function(player) {
	for (var i=0; i<player_collection.length; i++) {
		var player = player_collection[i];
		if (player.getId() === player.getId()) {
			player_collection .splice(i,1);
			return true;
		}
	}
	return false;
}

exports.getAllPlayers = function() {
	return player_collection;
}
