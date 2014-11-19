
var Game = require("../models/game.js");
var gameCollection = require("../models/gamecollection.js");

exports.renderLobby = function(req, res) {
	var games = gameCollection.getAllGames();
	res.render("game/game_lobby", {"games" : games});
}

exports.makeGame = function(req, res) {
}