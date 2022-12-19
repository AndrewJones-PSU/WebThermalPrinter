const express = require("express");
const config = require("./config.json");
const app = express();

// Dynamically import routes
require("./routes/routeloader")(app);

const PORT = config.port;
if (!PORT) throw new Error("PORT is not defined in config.json");
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
