const config = require("../config.json");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: { files: config.server.maxFileCount, fileSize: config.server.maxFileSize },
});

function print(app) {
	app.post("/print", upload.any(), (req, res) => {
		res.status(200);
		res.send("Print");
	});
}

module.exports = print;
