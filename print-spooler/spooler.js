// TODO: This should be an https server,
const express = require("express");
const config = require("./../config.json");

const app = express();
app.use(express.json());

// Dynamically import routes
require("./routes/routeloader")(app, multerUpload);

const PORT = config.server.port;
if (!PORT) throw new Error("PORT is not defined in config.json");
app.listen(PORT, () => {
	console.log(`Spooler is running on port ${PORT}`);
});
