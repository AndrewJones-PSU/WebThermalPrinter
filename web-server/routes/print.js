const config = require("../../config.json");

const GetPrintableImages = require("../src/GetPrintableImages.js");
const WebServerToSpooler = require("../src/WebServerToSpooler.js");

function print(app, multerUpload) {
	app.post("/print", multerUpload.array("allfiles"), (req, res) => {
		// feed files into getPrintableImages
		GetPrintableImages(req.files)
			.catch((err) => {
				res.status(400);
				res.send(err.toString());
				return "ERROR";
			})
			.then((images) => {
				if (images === "ERROR") return;
				// now send the images to the spooler
				WebServerToSpooler.sendImagesToSpooler(images)
					.catch((err) => {
						// result is an error message of type Error
						res.status(500);
						res.send("Failed to add files to spooler queue: " + err);
					})
					.then((result) => {
						if (result.substr(0, 7) === "Success") {
							res.status(200);
							res.send(result);
						}
					});
			});
	});
}

module.exports = print;
