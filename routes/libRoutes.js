
var libModel = require("../models/lib.js");

exports.loadTemplates = function(fs) {
	var jsonName = "models/libTemplates.json";
	fs.readFile(jsonName, function(err, data) {
		if(err) {
			console.log(err);
		} else {
			libModel.loadTemplates(data);
		}
	})
}

exports.getAllLibs = function(req, res) {
	var allLibs = libModel.getAllLibs();
	res.render("lib/lib_listAllTemplates", {"allLibs" : allLibs});
}