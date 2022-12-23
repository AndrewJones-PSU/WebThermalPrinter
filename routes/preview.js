function preview(app) {
	app.get("/preview", (req, res) => {
		res.status(200);
		res.send("Preview");
	});
}

module.exports = preview;
