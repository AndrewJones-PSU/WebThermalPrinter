const config = require("/config.json");
const RequestValidation = require("../src/RequestValidation.js");
const Spooler = require("../src/Spooler.js");

// Print route does 2 things to the files:
// A: It validates the files using src/ImageValidation.js
// 2: It adds the files to the spooler queue using src/Spooler.js
function print(app, multerUpload) {
	app.post("/print", multerUpload.array("files"), async (req, res) => {
		let files = [];
		// First, convert files to base64 strings
		for (let i = 0; i < req.files.length; i++) {
			files.push(RequestValidation.bufferToBase64(req.files[i].buffer));
		}
		// Append a cut command to the end of the files
		files.push("data:text/plain,base64:Q1VU");

		// Validate each file, and send an error if any are invalid
		for (let i = 0; i < files.length; i++) {
			// For each file, check if it is valid
			if (!RequestValidation.validateImage(files[i])[0]) {
				// If the file is invalid, send an error and return
				res.status(400);
				res.send("File " + i + " is Invalid (" + RequestValidation.validateImage(files[i])[1] + ")");
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
