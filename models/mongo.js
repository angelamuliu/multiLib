var util = require("util");
var mongoClient = require('mongodb').MongoClient;
var BSON = require('mongodb').BSONPure; // Used to locate docs by doc id

/*
 * This is the connection URL
 * Give the IP Address / Domain Name (else localhost)
 * The typical mongodb port is 27012
 * The path part (here "fallTest") is the name of the databas
 */


 // Default to localhost connection
var url = 'mongodb://127.0.0.1:27017/libs';

// if openshift env variables are present, we need to connect to Openshift's mongo
// end result: 'mongodb://user:password@host:port/app_name' 
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  url = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

console.log(url);

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
