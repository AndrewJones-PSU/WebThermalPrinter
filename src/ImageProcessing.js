// Given a base64 image file, format it for printing
// Formatting includes:
// - resizing to config.img.width (default is 576 px wide)
// - converting to black and white (NOT grayscale) using config.img.bwmethod (can be "none", "threshold", or "floyd-steinburg")
// - converting format to PNG, if necessary
// returned image is a base64 string

// Import modules
const config = require("../config.json");
const Jimp = require("jimp");

async function formatImage(img) {
	// Create a Jimp image from the base64 string
	let image = await Jimp.read(Buffer.from(img, "base64"));
	// Resize the image
	image.resize(config.img.width, Jimp.AUTO);
	// Convert the image to black and white
	switch (config.img.bwmethod) {
		default: // if invalid, default to grayscale
			image = image.grayscale();
			break;
		case "none": // if none, just make grayscale and let the printer auto-threshold
			image = image.grayscale();
			break;
		case "threshold":
			image = image.threshold(config.img.threshold);
			break;
		case "floyd-steinberg":
			image = floydSteinberg(image);
			break;
	}
	// Convert the image to PNG, if necessary
	if (image.getExtension() !== "png") {
		image = await image.getBufferAsync(Jimp.MIME_PNG);
	}
	// Return the base64 string
	return image.toString("base64");
}

// Given a Jimp image, convert it to black and white using the Floyd-Steinberg algorithm
function floydSteinberg(image) {
	// TODO: implement this
	return image;
}

module.exports = formatImage;
