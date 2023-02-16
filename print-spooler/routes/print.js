const config = require("../../config.json");
const ImageValidation = require("../src/ImageValidation.js");

// Print route does 2 things to the files:
// A: It validates the files using src/ImageValidation.js
// 2: It adds the files to the spooler queue using src/Spooler.js
function print(app, multerUpload) {
	app.post("/print", multerUpload.array("files"), async (req, res) => {
		// Validate files
		let files = req.files;
		let validFiles = [];
		for (let i = 0; i < files.length; i++) {
			validFiles.push(ImageValidation.validateImage(files[i]));
		}
		validFiles = await Promise.all(validFiles);

		// Add files to spooler queue
	});
}

module.exports = print;
