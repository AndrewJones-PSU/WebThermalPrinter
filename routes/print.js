const config = require("../config.json");

function print(app, multerUpload) {
	app.post("/print", multerUpload.any(), (req, res) => {
		res.status(200);
		res.send("Print");
	});
}

module.exports = print;
