// TODO: This should be an https server

// check if dev environment, if so, import config.json and env.json from parent directory
// (in production, these files are imported by the build script, but in development,
// we want to be able to edit them without having to copy the file to
// every subdirectory that needs it).

if (process.env.NODE_ENV !== "production") {
	const fs = require("fs");
	console.warn("Dev environment detected, copying configs from parent directory.");
	console.warn(
		"Since environment variables are loaded before this script runs, you may need to restart this process for changes to take effect."
	);
	fs.copyFileSync("./../config.json", "./config.json");
	fs.copyFileSync("./../.env", "./.env");
}

const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const multerUpload = multer({
	storage: storage,
});
const Spooler = require("./src/Spooler.js");

const app = express();
app.use(express.json());

// Dynamically import routes
require("./routes/routeloader")(app, multerUpload);

const PORT = global.parseInt(process.env.spoolerPort);
if (!PORT) throw new Error("PORT is not defined in env.json");
app.listen(PORT, () => {
	console.log(`Spooler is running on port ${PORT}`);
});

// start the spooler queue loop
Spooler.startQueueLoop();
