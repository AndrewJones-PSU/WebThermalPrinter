// check if dev environment, if so, import config.json and env.json from parent directory
// (in production, these files are imported by the build script, but in development,
// we want to be able to edit them without having to copy the file to
// every subdirectory that needs it).

if (process.env.NODE_ENV === "development") {
	const fs = require("fs");
	console.log("Dev environment detected, copying configs from parent directory");
	fs.copyFileSync("./../config.json", "./config.json");
	fs.copyFileSync("./../env.json", "./env.json");
}

const express = require("express");
const config = require("./config.json");
const multer = require("multer");
const storage = multer.memoryStorage();
const multerUpload = multer({
	storage: storage,
	limits: { files: config.server.maxFileCount, fileSize: config.server.maxFileSize },
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamically import routes
require("./routes/routeloader")(app, multerUpload);

const PORT = config.server.port;
if (!PORT) throw new Error("PORT is not defined in config.json");
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
