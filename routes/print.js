function print(app) {
	app.post("/print", (req, res) => {
		res.status(200);
		res.send("Print");
	});
}

module.exports = print;
