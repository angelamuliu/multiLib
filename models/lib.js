
// Lib template model
// Templates are stored in json and loaded into the collection

// -------------------------------------------------

var lib_collection = [];

exports.loadTemplates = function(jsonfile_loc) {
	var jsondat = JSON.parse(jsonfile_loc);
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