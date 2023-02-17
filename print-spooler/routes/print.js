const config = require("../../config.json");
const ImageValidation = require("../src/ImageValidation.js");
const Spooler = require("../src/Spooler.js");

// Print route does 2 things to the files:
// A: It validates the files using src/ImageValidation.js
// 2: It adds the files to the spooler queue using src/Spooler.js
function print(app, multerUpload) {
	app.post("/print", multerUpload.array("files"), async (req, res) => {
		// Validate files
		let files = req.files;
		// Validate each file, and send an error if any are invalid
		for (let i = 0; i < files.length; i++) {
			// For each file, check if it is valid
			if (!ImageValidation.validateImage(files[i])[0]) {
				// If the file is invalid, send an error and return
				res.status(400);
				res.send(
					"Invalid file: " + files[i].originalname + " (" + ImageValidation.validateImage(files[i])[1] + ")"
				);
				return;
			}
		}
		// If all files are valid, add them to the spooler queue
	});
}

module.exports = print;
