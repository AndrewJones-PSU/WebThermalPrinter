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
	// Convert to grayscale
	image = image.grayscale();
	// Get pixel values, make 2D array of black & white pixel values
	// TODO: do all of this directly in jimp instead of making a separate array
	let pixArray2d = new Array(image.bitmap.width).fill(0).map(() => new Array(image.bitmap.height).fill(0));
	for (let x = 0; x < image.bitmap.width; x++) {
		for (let y = 0; y < image.bitmap.height; y++) {
			pixArray2d[x][y] = Jimp.intToRGBA(image.getPixelColor(x, y)).r;
		}
	}
	// Convert to black and white using Floyd-Steinberg algorithm
	for (let x = 0; x < image.bitmap.width; x++) {
		for (let y = 0; y < image.bitmap.height; y++) {
			let oldColor = pixArray2d[x][y];
			let newColor = thresholdRound(oldColor);
			pixArray2d[x][y] = newColor;
			let error = oldColor - newColor;
			if (x < image.bitmap.width - 1) {
				pixArray2d[x + 1][y] = pixArray2d[x + 1][y] + (error * 7) / 16;
			}
			if (x > 0 && y < image.bitmap.height - 1) {
				pixArray2d[x - 1][y + 1] = pixArray2d[x - 1][y + 1] + (error * 3) / 16;
			}
			if (y < image.bitmap.height - 1) {
				pixArray2d[x][y + 1] = pixArray2d[x][y + 1] + (error * 5) / 16;
			}
			if (x < image.bitmap.width - 1 && y < image.bitmap.height - 1) {
				pixArray2d[x + 1][y + 1] = pixArray2d[x + 1][y + 1] + (error * 1) / 16;
			}
		}
	}
	// Convert 2D array of black & white pixel values to Jimp image
	for (let x = 0; x < image.bitmap.width; x++) {
		for (let y = 0; y < image.bitmap.height; y++) {
			let color = thresholdRound(pixArray2d[x][y]);
			image.setPixelColor(Jimp.rgbaToInt(color, color, color, 255), x, y);
		}
	}
	return image;
}

// helper function for Floyd-Steinberg algorithm
function thresholdRound(value) {
	if (value < 128) {
		return 0;
	}
	return 255;
}

module.exports = formatImage;
