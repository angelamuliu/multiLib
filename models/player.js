
// Player model

// -------------------------------------------------

function Player(id) {
	this.id = id;
}

Player.prototype.getId = function() {
	return this.id;
}

Player.prototype.test = function() {
	return "TEST!";
}

module.exports = Player;
