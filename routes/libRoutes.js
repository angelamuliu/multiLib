
var libModel = require("../models/lib.js");

exports.loadTemplates = function(fs) {
	var jsonName = "models/libTemplates.json";
	console.log("TEST");
	fs.readFile(jsonName, function(err, data) {
		if(err) {
			console.log(err);
		} else {
			console.log(data);
			libModel.loadTemplates(data);
		}
	})
}

exports.getAllLibs = function(req, res) {
	var allLibs = libModel.getAllLibs();
	console.log(allLibs);
	res.render("lib/lib_listAllTemplates", {"allLibs" : allLibs});
}