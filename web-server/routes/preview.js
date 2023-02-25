const config = require("../../config.json");

const GetPrintableImages = require("../src/GetPrintableImages.js");

function preview(app, multerUpload) {
	app.post("/preview", multerUpload.array("allfiles"), (req, res) => {
		// feed files into getPrintableImages
		GetPrintableImages(req.files)
			.catch((err) => {
				res.status(400);
				res.send(err.toString());
				return "ERROR";
			})
			.then((images) => {
				if (images === "ERROR") return;
				// now send the images to the client
				let b64images = "";
				for (let i = 0; i < images.length; i++) {
					// images is an array of arrays, each subarray including buffers.
					// we need to convert the buffers to base64 strings
					// TODO: Send these as multipart/form-data (or some other more efficient format) instead of base64 strings
					// check if images[i] is an array
					if (images[i] instanceof Array) {
						// check if images[i][j] is a buffer
						for (let j = 0; j < images[i].length; j++) {
							b64images += "data:image/png;base64," + images[i][j].toString("base64") + "\n";
						}
					} else if (images[i] instanceof Buffer) {
						// this shouldn't happen, but just in case
						b64images += "data:image/png;base64," + images[i].toString("base64") + "\n";
					} else if (typeof images[i] === "string") {
						b64images += images[i] + "\n";
					} else {
						console.error("preview.js: Unexpected data type in images array: " + typeof images[i]);
					}
				}
				res.status(200);
				res.send(b64images);
			});
	});
}

module.exports = preview;
