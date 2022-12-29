const config = require("../config.json");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: { files: config.server.maxFileCount, fileSize: config.server.maxFileSize },
});

const GetPrintableImages = require("../src/GetPrintableImages.js");

function preview(app) {
	app.get("/preview", upload.any(), (req, res) => {
		// feed files into getPrintableImages
		GetPrintableImages(req.files).then((images) => {
			// now send the images to the client
			res.status(200);
			res.send(images);
		});
	});
}

module.exports = preview;
