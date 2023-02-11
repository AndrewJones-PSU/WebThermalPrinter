const express = require("express");
const config = require("./../config.json");
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
