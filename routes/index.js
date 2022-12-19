// No home page, return a message that service is running

function index(app) {
	app.get("/", (req, res) => {
		res.status(200);
		res.send("Service is running");
	});
}

module.exports = index;
