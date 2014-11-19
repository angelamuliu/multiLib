
// PlayerCollection model
// Keeps track of all players as a collection

var Player = require('./player.js');

var player_collection = [];

exports.createPlayer = function(socket_id) {
	var newplayer = new Player(socket_id);
	player_collection.push(newplayer);
}

exports.deletePlayer = function(socket_id) {
	for (var i=0; i<player_collection.length; i++) {
		var player = player_collection[i];
		if (player.getId() === socket_id) {
			player_collection .splice(i,1);
			return true;
		}
	}
	return false;
}

exports.getAllPlayers = function() {
	return player_collection;
}
