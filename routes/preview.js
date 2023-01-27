const config = require("../config.json");

const GetPrintableImages = require("../src/GetPrintableImages.js");

function preview(app, multerUpload) {
	app.post("/preview", multerUpload.array("allfiles"), (req, res) => {
		console.log(req.files);
		// feed files into getPrintableImages
		GetPrintableImages(req.files)
			.catch((err) => {
				res.status(400);
				res.send("Error: " + err);
				return "ERROR";
			})
			.then((images) => {
				if (images === "ERROR") return;
				// now send the images to the client
				let b64images = "";
				for (let i = 0; i < images.length; i++) {
					b64images += images[i].toString("base64");
				}
				res.status(200);
				res.send(b64images);
			});
	});
}

module.exports = preview;
