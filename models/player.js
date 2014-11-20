
// Player model

// -------------------------------------------------

function Player(id) {
	this.id = id;
}

Player.prototype.getId = function() {
	return this.id;
}

module.exports = Player;
