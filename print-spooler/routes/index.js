// No home page, return a message that service is running

function index(app, multerUpload) {
	app.get("/", (req, res) => {
		res.status(200);
		res.send('Service "print-spooler" is running');
	});
}

module.exports = index;
