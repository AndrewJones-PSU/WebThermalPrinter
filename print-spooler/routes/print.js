const config = require("../../config.json");
const ImageValidation = require("../src/ImageValidation.js");
const Spooler = require("../src/Spooler.js");

// Print route does 2 things to the files:
// A: It validates the files using src/ImageValidation.js
// 2: It adds the files to the spooler queue using src/Spooler.js
function print(app, multerUpload) {
	app.post("/print", multerUpload.array("files"), async (req, res) => {
		// Validate files
		// start by splitting files by newline
		let files = req.body.files.split("\n");
		// remove empty lines
		files = files.filter((line) => line !== "");
		// Validate each file, and send an error if any are invalid
		for (let i = 0; i < files.length; i++) {
			// For each file, check if it is valid
			if (!ImageValidation.validateImage(files[i])[0]) {
				// If the file is invalid, send an error and return
				res.status(400);
				res.send("File " + i + " is Invalid (" + ImageValidation.validateImage(files[i])[1] + ")");
				return;
			}
		}
		// If all files are valid, add them to the spooler queue
		returnVal = Spooler.addImagesToQueue(files);
		if (returnVal) {
			res.status(200);
			res.send("Added " + files.length + " files to the spooler queue");
		} else {
			res.status(500);
			res.send("Failed to add files to spooler queue");
		}
	});
}

module.exports = print;
