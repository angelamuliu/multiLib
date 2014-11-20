
// Lib template model
// Templates are stored in json and loaded into the collection

// -------------------------------------------------

var lib_collection = [];

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

exports.loadJSON = function(fs) {
	var jsonName = "models/libTemplates.json";
	fs.readFile(jsonName, function(err, data) {
		if(err) {
			console.log(err);
		} else {
			var jsondat = JSON.parse(data);
			lib_collection = jsondat.libs;
		}
	})
}