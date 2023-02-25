const env = require("../../env.json");
const http = require("http");
const formdata = require("form-data");

function sendImagesToSpooler(images) {
	return new Promise((resolve, reject) => {
		let filesData = "";
		let form = new formdata();
		// For each image (or text cmd), add it to the form
		for (let i = 0; i < images.length; i++) {
			// check if images[i] is an array
			if (images[i] instanceof Array) {
				for (let j = 0; j < images[i].length; j++) {
					filesData += fileFormat(images[i][j]);
				}
			} else if (images[i] instanceof String || typeof images[i] === "string") {
				filesData += fileFormat(images[i]);
			} else {
				throw new Error("Unexpected data type in images array: " + typeof images[i]);
			}
		}
		// Add the form data to the form
		form.append("files", filesData);
		// Send the form to the spooler
		let request = http.request({
			method: "POST",
			host: env.spoolerIP,
			path: "/print",
			port: env.spoolerPort,
			headers: form.getHeaders(),
		});
		form.pipe(request);
		request.on("error", (err) => {
			reject("Error sending images to spooler");
		});
		request.on("response", (res) => {
			if (res.statusCode === 200) {
				res.on("data", (d) => {
					resolve("Success: " + d);
				});
			} else {
				res.on("data", (d) => {
					reject("Bad response sending images to spooler. (Status code: " + res.statusCode + ") " + d);
				});
			}
		});
	});
}

// This function converts the images to the correct format (Base64 string) before
// adding them to the form
function fileFormat(image) {
	// If the image is a buffer, convert to a base64 string, add the data:image/png;base64 header, and return
	if (image instanceof Buffer) {
		return "data:image/png;base64," + image.toString("base64") + "\n";
	}
	// if the image is a string, add the data:text/plain;base64 header and return
	else if (image instanceof String || typeof image === "string") {
		return "data:text/plain;base64," + Buffer.from(image).toString("base64") + "\n";
	}
	// otherwise, throw an error
	else {
		throw new Error("Invalid file format");
	}
}

module.exports = { sendImagesToSpooler };
