// TODO: This should be an https server,
const express = require("express");
const config = require("./../config.json");
const env = require("./../env.json");
const multer = require("multer");
const storage = multer.memoryStorage();
const multerUpload = multer({
	storage: storage,
	limits: { files: config.server.maxFileCount, fileSize: config.server.maxFileSize },
});
const Spooler = require("./src/Spooler.js");

const app = express();
app.use(express.json());

// Dynamically import routes
require("./routes/routeloader")(app, multerUpload);

const PORT = env.spoolerPort;
if (!PORT) throw new Error("PORT is not defined in env.json");
app.listen(PORT, () => {
	console.log(`Spooler is running on port ${PORT}`);
});

// start the spooler queue loop
Spooler.startQueueLoop();
