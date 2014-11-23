var util = require("util");
var mongoClient = require('mongodb').MongoClient;

/*
 * This is the connection URL
 * Give the IP Address / Domain Name (else localhost)
 * The typical mongodb port is 27012
 * The path part (here "fallTest") is the name of the databas
 */
var url = 'mongodb://localhost:27017/libs';
var mongoDB; // The connected database

// Use connect method to connect to the Server
mongoClient.connect(url, function(err, db) {
  if (err) doError(err);
  console.log("Connected correctly to server");
  mongoDB = db;
});

/* 
 * In the methods below, notice the use of a callback argument,
 * how that callback function is called, and the argument it is given.
 * Why can't the insert, find, and update functions just return the
 * data directly?
 */

// INSERT a lib into the db
exports.insert = function(game_name, lib_str, template_name, callback) {
	// FIRST: Build query from given args
	// THEN: Insert into libs collection EVERY TIME with this query
	// AND THEN: That's it!!!
	// http://localhost:50000/fruit/insert?name=pear&price=2
	var doc = {name: game_name, libstr: lib_str, template:template_name};
	console.log(doc);
	mongoDB.collection("libs").insert(
		doc,
		{safe: true},
		function(err, crsr) {
			if (err) doError(err);
			callback(crsr);
		});
}

// Actually just finds ALL libs in the db
exports.find = function(callback) {
	var crsr = mongoDB.collection("libs").find();
	crsr.toArray(function(err, libs) {
		if (err) {
			console.log(err);
		}
		callback(libs);
	})
}

// UPDATE
exports.update = function(collection, query, callback) {
          mongoDB.collection(collection).update(
            JSON.parse(query.find),
            JSON.parse(query.update), {
              new: true
            }, function(err, crsr) {
              if (err) doError(err);
              callback('Update succeeded');
        });
  }

var doError = function(e) {
        util.debug("ERROR: " + e);
        throw new Error(e);
    }
