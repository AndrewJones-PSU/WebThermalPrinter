const env = require("../../env.json");
const http = require("http");
const formdata = require("form-data");

function sendImagesToSpooler(images) {
	let form = new formdata();
	// For each image (or text cmd), add it to the form
	for (let i = 0; i < images.length; i++) {
		// check if images[i] is an array
		if (images[i] instanceof Array) {
			// check if images[i][j] is a buffer
			for (let j = 0; j < images[i].length; j++) {
				form.append("files", fileFormat(images[i][j]));
			}
		} else if (images[i] instanceof String) {
			form.append("files", fileFormat(images[i]));
		} else {
			throw new Error("Unexpected data type in images array: " + typeof images[i]);
		}
	}
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
		return Error("Error sending images to spooler");
	});
	request.on("response", (res) => {
		if (res.statusCode === 200) {
			return "Success";
		} else {
			return Error("Error sending images to spooler");
		}
	});
}

// This function converts the images to the correct format before adding
// them to the form
function fileFormat(image) {
	// If the image is a buffer, return it, as it is in the correct format
	if (image instanceof Buffer) {
		return image;
	}
	// if the image is a string, convert it to a string buffer
	else if (image instanceof String) {
		return Buffer.from(image);
	}
	// otherwise, throw an error
	else {
		throw new Error("Invalid file format");
	}
}

module.exports = { sendImagesToSpooler };