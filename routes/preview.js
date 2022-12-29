const config = require("../config.json");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: { files: config.server.maxFileCount, fileSize: config.server.maxFileSize },
});

function preview(app) {
	app.get("/preview", upload.any(), (req, res) => {
		res.status(200);
		res.send("Preview");
	});
}

module.exports = preview;
