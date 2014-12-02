var util = require("util");
var mongoClient = require('mongodb').MongoClient;
var BSON = require('mongodb').BSONPure; // Used to locate docs by doc id
var mongoDB; // The database

var url = 'mongodb://127.0.0.1:27017/libs'; // Default to localhost connection

// Set up connections to mongo and initialize the DB
exports.mongoinit = function() {
	// if openshift env variables are present, we need to connect to Openshift's mongo
	// end result: 'mongodb://user:password@host:port/app_name' 
	if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
		url = 'mongodb://' + process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
		process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
		process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
		process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
		process.env.OPENSHIFT_APP_NAME + '/libs';
	}
	console.log(url);
	// Use connect method to connect to the Server
	mongoClient.connect(url, function(err, db) {
  		if (err) doError(err);
  		console.log("Connected correctly to server");
  		mongoDB = db;
	});
}

// INSERT a lib into the db
exports.insert = function(game_name, lib_str, template_name, callback) {
	// FIRST: Build query from given args
	// THEN: Insert into libs collection with this query
	var doc = {name: game_name, libstr: lib_str, template:template_name};
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
		if (err) doError(err);
		callback(libs);
	})
}

// Given the doc id, delete a doc in collection libs
exports.delete = function(lib_id, callback) {
	// To get docs by doc id, we have to convert it into an ObjectID obj
	var obj_id = BSON.ObjectID.createFromHexString(lib_id);
	var toDelete_doc = {_id: obj_id};
	mongoDB.collection("libs").remove(toDelete_doc,
		function(err, crsr) {
			if (err) doError(err);
			callback('Delete successful');
		});
}



var doError = function(e) {
        util.debug("ERROR: " + e);
        throw new Error(e);
    }
