
// Lib template model
// Templates are stored in json and loaded into the collection

// -------------------------------------------------

var lib_collection = [];

exports.loadTemplates = function(jsonfile) {
	console.log(jsonfile);
	var jsondat = JSON.parse(jsonfile);
	lib_collection = jsondat.libs;
}

exports.getLib = function(id) {
	// Lib ids are set by the json file, id corresponds to place in collection
	if (id < lib_collection.length) {
		return lib_collection[id];
	} else {
		return null;
	}
}

exports.getAllLibs = function() {
	return lib_collection;
}