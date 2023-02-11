// Dynamically load in routes from the routes/ directory
const fs = require("fs");

function dynamicallyLoadRoutes(app, multerUpload) {
	// Read all of the filenames in the current folder, then apply this function
	//  to each of them
	fs.readdirSync(__dirname).forEach(function (file) {
		// Make sure we skip this file (since it's not a route) and all non JS files
		if (file === "routeloader.js" || file.substr(file.lastIndexOf(".") + 1) !== "js") return;

		// Let's grab the name of the file
		let name = file.substr(0, file.indexOf("."));
		// Add the routes file to the exports
		require("./" + name)(app, multerUpload);
		console.log("Loaded route: " + name);
	});
}

// Export this function to dynamically load routes from the files in the folder
module.exports = dynamicallyLoadRoutes;
